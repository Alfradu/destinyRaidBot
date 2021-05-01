const { Service } = require('./service.js');
const Discord = require('discord.js');
const utils = require('./utils.js');
const { prefix, token } = require('config.json');
const client = new Discord.Client({ autoReconnect: true,  partials: ["USER", 'MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();
const lastExecutedCommands = new Discord.Collection();
let service = new Service(client);

const cancelRaid = require('./commands/cancel raid.js');
const commands = require('./commands/commands.js');
const displayRaids = require('./commands/display raids.js');
const editRaid = require('./commands/edit raid.js');
const registerRaid = require('./commands/register raid.js');

client.commands.set(cancelRaid.name, cancelRaid);
client.commands.set(commands.name, commands);
client.commands.set(displayRaids.name, displayRaids);
client.commands.set(editRaid.name, editRaid);
client.commands.set(registerRaid.name, registerRaid);

var currentTitle = 'MAKE DESTINY 2 RAIDING YOUR CORE SERVER CAPABILITY';
client.on('ready', async () => {
    service.startTimer();
    utils.debug('Destiny raid bot ready');
    client.user.setActivity(currentTitle);
});

client.on('error', err => {
    utils.debug('Error: ' + err.message);
});

client.on('disconnected', () => {
    utils.debug('Crashed, reconnecting');
});

client.on('messageReactionAdd', async (message, user) => {
    try {
        let msg = await service.fetchMessageFromMessage(message);
        registerRaid.reacted(message._emoji.name, msg, user);
    }
    catch (error) {
        console.error(error);
    }
});

client.on('messageReactionRemove', async (message, user) => {
    try {
        let msg = await service.fetchMessageFromMessage(message);
        registerRaid.unreacted(message._emoji.name, msg, user);
    }
    catch (error) {
        console.error(error);
    }
});

client.on('message', message => {
    //TODO: move to service
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check command name + potential aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    //check if guildOnly: true
    if (command.guildOnly && message.channel.type === 'dm') return;

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
    if (!lastExecutedCommands.has(command.name)) {
        lastExecutedCommands.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = lastExecutedCommands.get(command.name);
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
