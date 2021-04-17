const utils = require('../utils.js');
const { Raid } = require('../Raid.js');
const db = require('../db.js');

function execute(message, args) {
    let msgEmbed = {};
    //raid name: VoG GoS SotP LW Levi CoS EoW SoS DSC
    if (!utils.raids[args[0].toLowerCase()]) return; //TODO change return
    const info = args.splice(3).join(" ");
    msgEmbed.title = utils.raids[args[0].toLowerCase()][0] + ". " + info;
    let timePart = args[2].split(':');
    if (!args[1] || !timePart[0] || !timePart[1]) return; //TODO change return
    let date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), args[1], timePart[0], timePart[1], 0, 0);
    if (startDate < Date.now()) return; //TODO change return
    msgEmbed.description = "Starting on: " + startDate.toString(); //TODO fix timezones
    const raidLeader = message.author;
    msgEmbed.members = "1. <@" + raidLeader.id + ">\n2.\n3.\n4.\n5.\n6.";
    let msg = utils.createMessage(msgEmbed);
    message.channel.send({
        embed: msg,
        files: [{
            attachment: './src/images/' + utils.raids[args[0].toLowerCase()][1],
            name: "raid.jpg"
        }]
    }).then(async message => {
        await message.react(utils.reacts[0]);
        await message.react(utils.reacts[1]);
        await message.react(utils.reacts[2]);
        message.pin().catch(error => console.error('Failed to pin message'));
    });
    var raid = new Raid(
        message.id,
        message.channel.guild.id,
        message.channel.id,
        raidLeader.id,
        startDate,
        startDate - 1500000,
        info,
        args[0].toLowerCase(),
        {
            id: 0,
            userID: raidLeader.id,
            team: 0
        });
    db.createRaid(raid);
}
function reacted(message, reactUser) {
    if (reactUser.bot) return;
    console.log(reactUser.username + " adding react from message " + message.message.id);
    if (!utils.messageExists(message.message)) return;
    if (!utils.reacts.includes(message._emoji.name)) return;
    let messageFile = utils.readFile(message.message);
    if (reactUser.id == messageFile.leader) return;
    let users = messageFile.members;
    console.log(users.filter(m => m.userID === reactUser.id).length);
    if (users.filter(m => m.userID === reactUser.id).length > 0) {
        let otherReacts = utils.reacts.filter(r => r !== message._emoji.name);
        console.log(otherReacts);
        messageFile.members = messageFile.members.filter(m => m.userID !== reactUser.id);
        otherReacts.forEach(r => {
            console.log("removing reaction :: " + r + " :: " + reactUser.id);
            message.message.reactions.resolve(r).users.remove(reactUser.id);
        });
    }
    let newMember = {};
    newMember.id = users.length;
    newMember.userID = reactUser.id;
    switch (message._emoji.name) {
        case utils.reacts[0]:
            let members = users.filter(m => m.team == 0);
            newMember.team = members.length > 5 ? 1 : 0;
            break;
        case utils.reacts[1]:
            newMember.team = 1;
            break;
        case utils.reacts[2]:
            newMember.team = 2;
            break;
    }
    messageFile.members.push(newMember);
    utils.writeFile(message.message, {
        leader: messageFile.leader,
        date: messageFile.date,
        reminderdate: messageFile.date - 15 * 60000,
        comment: messageFile.comment,
        raid: messageFile.raid,
        members: messageFile.members
    });
    let members = messageFile.members.filter(m => m.team == 0);
    let index = 1;
    let confirmed = members.map(member => {
        return `${index++}. <@${member.userID}>`;
    });
    for (; index < 7; index++) {
        confirmed.push(`${index}.`);
    }
    let standin = messageFile.members.filter(m => m.team == 1);
    index = 1;
    let waiting = standin.map(member => {
        return `${index++}. <@${member.userID}>`;
    });

    let msgEmbed = {};
    msgEmbed.members = `${confirmed.join('\n')}`;
    if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
    msgEmbed.title = message.message.embeds[0].title;
    msgEmbed.description = message.message.embeds[0].description;
    let msg = utils.createMessage(msgEmbed);
    message.message.edit({ embed: msg });
}
function unreacted(message, reactUser) {
    if (reactUser.bot) return;
    console.log(reactUser.username + " removing react from message " + message.message.id);
    if (!utils.messageExists(message.message)) return;
    if (!utils.reacts.includes(message._emoji.name)) return;
    let messageFile = utils.readFile(message.message);
    if (reactUser.id == messageFile.leader) return;
    let otherReacts = utils.reacts.filter(r => r !== message._emoji.name);
    let exit = false;
    otherReacts.forEach(r => {
        if (message.message.reactions.resolve(r).users.cache.array().filter(u => u.id === reactUser.id).length > 0) {
            exit = true;
        }
    });
    let newMembers = messageFile.members.filter(m => m.userID !== reactUser.id);
    let members = exit ? messageFile.members.filter(m => m.team == 0) : newMembers.filter(m => m.team == 0);
    let index = 1;
    let confirmed = members.map(member => {
        return `${index++}. <@${member.userID}>`;
    });
    for (; index < 7; index++) {
        confirmed.push(`${index}.`);
    }
    let standin = exit ? messageFile.members.filter(m => m.team == 1) : newMembers.filter(m => m.team == 1);
    index = 1;
    let waiting = standin.map(member => {
        return `${index++}. <@${member.userID}>`;
    });

    let msgEmbed = {};
    msgEmbed.members = `${confirmed.join('\n')}`;
    msgEmbed.standins = `${waiting.join('\n')}`;
    msgEmbed.title = message.message.embeds[0].title;
    msgEmbed.description = message.message.embeds[0].description;
    let msg = utils.createMessage(msgEmbed);
    message.message.edit({ embed: msg });
    if (exit) return;
    utils.writeFile(message.message, {
        leader: messageFile.leader,
        date: messageFile.date,
        comment: messageFile.comment,
        raid: messageFile.raid,
        members: newMembers
    });
}
module.exports = {
    name: 'raid',
    aliases: ['r', 'register'],
    args: true,
    guildOnly: true,
    description: 'Create a listing for a raid.',
    usage: '<arg1 raid name> <arg2 time dd hh:mm> <arg3 additional info>',
    cooldown: 1,
    execute,
    reacted,
    unreacted
};