const utils = require('./utils.js');
const db = require('./db.js');
const time = 60000;
const { forEach } = require('lodash');

class Service {
    client;
    constructor(client) {
        this.client = client;
    }

    startTimer() {
        this.checkRaidTimes();
        setInterval(this.checkRaidTimes.bind(this), time);
    }

    checkRaidTimes() {
        utils.debug("Checking raid times");
        this.sendRaidReminders();
        this.archivePastRaids();
    }

    async archivePastRaids() {
        let activeRaids = await db.getPastRaids();
        forEach(activeRaids, raid => {
            this.archiveRaid(raid);
            db.deleteRaid(raid.id);
            //TODO: use update active = false in future for tracing messages? 
            //only delete inactive raids that have been there for too long
        });
    }

    async archiveRaid(raid) {
        let message = await this.fetchMessageFromRaid(raid);
        await message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        await message.unpin().catch(error => console.error('Failed to unpin message.', error));
        let embeds = message.embeds[0];
        embeds.title = "Raid listing archived: " + embeds.title;
        embeds.color = 0xdc3939;
        embeds.thumbnail = {};
        embeds.thumbnail.url = 'attachment://raid.jpg';
        message.edit({ embed: embeds });
    }

    async sendRaidReminders() {
        let reminderRaids = await db.getReminderRaids();
        forEach(reminderRaids, raid => {
            this.sendReminder(raid);
            raid.remind = false;
            db.updateRaid(raid);
        });
    }

    async sendReminder(raid) {
        let message = await this.fetchMessageFromRaid(raid);
        await message.reactions.resolve(utils.reacts.w).users.fetch();
        await message.reactions.resolve(utils.reacts.h).users.fetch();
        await message.reactions.resolve(utils.reacts.t).users.fetch();
        await message.reactions.resolve(utils.reacts.f).users.fetch();
        await message.reactions.resolve(utils.reacts['?']).users.fetch();
        let members = raid.members.filter(m => m.team == utils.teams.MEMBERS);
        let index = 1;
        let confirmed = members.map(member => {
            index++;
            return `${member.role} <@${member.userId}>`;
        });
        for (; index < 7; index++) {
            confirmed.push(`${index}.`);
        }
        let standin = raid.members.filter(m => m.team == utils.teams.STANDINS);
        let waiting = standin.map(member => {
            return `${member.role} <@${member.userId}>`;
        });
        let msgEmbed = {};
        msgEmbed.title = "Raid is about to start - " + utils.raids[raid.raid][0];
        msgEmbed.description = `This is a scheduled notice for a raid starting in 15 minutes. \nRaid listed in channel: <#${message.channel.id}>`;
        msgEmbed.members = `${confirmed.join('\n')}`;
        msgEmbed.image = message.embeds[0].thumbnail.url;
        msgEmbed.thumbnail = {};
        msgEmbed.thumbnail.url = 'attachment://raid.jpg';
        if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
        msgEmbed.color = 0x7978c7;
        msgEmbed.footer = ``;
        let msg = utils.createMessage(msgEmbed);
        forEach(members, async member => {
            let user = await this.fetchUserFromMessage(message, member.userId);
            utils.debug("sending reminder to raid member " + user.user.username);
            user.send({
                embed: msg
            }).catch(err => console.log(err));
        });
    }
    async fetchMessageFromRaid(raid) {
        let ch = await this.client.channels.fetch(raid.channelid);
        let message = await ch.messages.fetch(raid.id);
        return message;
    }
    async fetchMessageFromMessage(message) {
        let ch = await this.client.channels.fetch(message.message.channel.id);
        let msg = await ch.messages.fetch(message.message.id);
        return msg;
    }
    async fetchUserFromMessage(message, user) {
        return await message.channel.guild.members.fetch(user);
    }
}

module.exports = {
    Service
}