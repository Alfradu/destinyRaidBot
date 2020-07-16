const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');
const Discord = require('discord.js');
const { prefix, token, channel } = require('config.json');
const { forEach } = require('lodash');

const cancelRaid = require('./commands/cancel raid');
const commands = require('./commands/commands');
const delayRaid = require('./commands/delay raid');
const displayRaids = require('./commands/display raids');
const editRaid = require('./commands/edit raid');
const registerRaid = require('./commands/register raid');

const client = new Discord.Client({ autoReconnect: true });
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

var currentTitle = '';

client.commands.set(cancelRaid.name, cancelRaid);
client.commands.set(commands.name, commands);
client.commands.set(delayRaid.name, delayRaid);
client.commands.set(displayRaids.name, displayRaids);
client.commands.set(editRaid.name, editRaid);
client.commands.set(registerRaid.name, registerRaid);

const dbFolderPath = path.join(__dirname, '_db');

client.on('ready', async () => {
    await fs.mkdir(dbFolderPath, (err) => {
        if (err && err.code !== 'EEXIST') {
            throw err;
        }
    });
    const files = fs.readdirSync(dbFolderPath);
    const ch = await client.channels.fetch(channel);
    forEach(files, async (fileName) => {
        const message = await ch.messages.fetch(fileName, true);
        let dateCheck = Date.parse(utils.readFile(message.id).date) < Date.now();
        if (dateCheck) {
            utils.archiveRaid(message);
        } else {
            await message.reactions.resolve('✅').users.fetch();
            let currentFile = utils.readFile(fileName);
            utils.debug(Date.parse(currentFile.date));
            utils.activateRaid(message, currentFile.leader, Date.parse(currentFile.date));
        }
    });
    console.log('*** destiny raid bot ready ***');
});

client.on('error', err => {
    console.log('*** error: ' + err.message + ' ***');
});

client.on('disconnected', () => {
    console.log('*** crashed, reconnecting ***');
});

client.on('messageReactionAdd', async (message, user) => {
    const command = client.commands.get("raid");
    try {
        command.reacted(message, user);
    }
    catch (error) {
        console.error(error);
    }
});

client.on('messageReactionRemove', (message, user) => {
    const command = client.commands.get("raid");
    try {
        command.reacted(message, user);
    }
    catch (error) {
        console.error(error);
    }
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (!channel) return message.reply('Please specify a channel for communicating with me.');
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check command name + potential aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    //check if guildOnly: true
    if (command.guildOnly && message.channel.id != channel) return;

    // check if admin or not
    // BE CAREFUL SO YOU ADD MODONLY ONLY WHERE YOU HAVE GUILDONLY TAGS
    if (command.modOnly == 'administrator' && !message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send(`I can't let you do that, ${message.author}`);
    }

    // check if args: true and if args are provided
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        // check if usage is specified
        if (command.usage) {
            reply += `\nThe proper usage would be:\n \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
    // check cooldowns
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (!timestamps.has(message.author.id)) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    else {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    //  run command
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('There was an error running ' + command.name);
    }
});

client.login(token);
