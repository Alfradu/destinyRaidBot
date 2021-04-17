const utils = require('./utils.js');
const db = require('./db.js');
const time = 60000;
const { forEach } = require('lodash');
const Discord = require('discord.js');
const client = new Discord.Client();

function startTimer() {
    setInterval(checkRaidTimes, time);
}

async function checkRaidTimes() {
    utils.debug("Checking raid times");
    archivePastRaids();
    sendRaidReminders();
}

async function archivePastRaids() {
    var activeRaids = await db.getPastRaids();
    forEach(activeRaids, raid => {
        archiveRaid(raid);
        db.deleteRaid(raid);
    });
}

function archiveRaid(raid) {
    let message = fetchMessage(raid);
    message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    message.unpin().catch(error => console.error('Failed to unpin message.'));
    let embeds = message.embeds[0];
    embeds.title = "Raid listing archived: " + embeds.title;
    embeds.color = 0xdc3939;
    embeds.thumbnail = {};
    embeds.thumbnail.url = 'attachment://raid.jpg';
    message.edit({ embed: embeds });
}

async function sendRaidReminders() {
    var reminderRaids = db.getReminderRaids();
    forEach(reminderRaids, raid => {
        sendReminder(raid);
        db.updateRaid(raid);
    });
}

async function sendReminder(raid) {
    let message = fetchMessage(raid);
    await message.reactions.resolve('✅').users.fetch();
    await message.reactions.resolve('❓').users.fetch();
    let members = message.members.filter(m => m.team == utils.teams.MEMBERS);
    let index = 1;
    let confirmed = members.map(member => {
        return `${index++}. <@${member.userID}>`;
    });
    for (; index < 7; index++) {
        confirmed.push(`${index}.`);
    }
    let standin = message.members.filter(m => m.team == utils.teams.STANDINS);
    index = 1;
    let waiting = standin.map(member => {
        return `${index++}. <@${member.userID}>`;
    });
    let msgEmbed = {};
    msgEmbed.title = "Raid is about to start - " + message.title;
    msgEmbed.description = "This is a scheduled notice for a raid starting in 15 minutes.";
    msgEmbed.members = `${confirmed.join('\n')}`;
    msgEmbed.image = message.embeds[0].thumbnail.url;
    msgEmbed.thumbnail = {};
    msgEmbed.thumbnail.url = 'attachment://raid.jpg';
    if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
    msgEmbed.color = 0x7978c7;
    msgEmbed.footer = "Click here to see the raid listing <#${"+message.channel.id+"}>";
    let msg = utils.createMessage(msgEmbed);
    forEach(members, member => {
        let user = message.channel.guild.members.cache.get(member.userID);
        console.log("sending message to raid member " + user.username);
        user.send({
            embed: msg
        }).catch(err => console.log(err));
    });
}

async function fetchMessage(raid){
    let ch = await client.channels.fetch(raid.channelid);
    const message = await ch.messages.fetch(raid.id, true);
    return message;
}

module.exports = {
    startTimer
} 