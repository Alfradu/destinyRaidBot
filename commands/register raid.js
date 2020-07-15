const fs = require('fs');
const utils = require('../utils.js');
const { forEach } = require('lodash');

const raids = {
    "vog": "Vault of Glass",
    "gos": "Garden of Salvation",
    "sotp": "Scourge of the Past",
    "lw": "Last Wish",
    "levi": "Leviathan",
    "cos": "Crown of Sorrow",
    "eow": "Eater of Worlds",
    "sos": "Spire of Stars"
};

module.exports = {
    name: 'raid',
    aliases: ['r'],
    args: true,
    guildOnly: true,
    description: 'Create a listing for a raid.',
    usage: '<arg1 raid name> <arg2 time dd hh:mm> <arg3 additional info>',
    cooldown: 1,
    execute(message, args) {
        let msgEmbed = {};
        //raid name: VoG GoS SotP LW Levi CoS EoW SoS DSC
        if (!raids[args[0].toLowerCase()]) return; //TODO change return
        const info = args.splice(3).join(" ");
        msgEmbed.title = raids[args[0].toLowerCase()] + " : " + info;
        //raid time:
        //dd hh:mm
        let datePart = args[1];
        let timePart = args[2].split(':');
        if (!datePart || !timePart[0] || !timePart[1]) return; //TODO change return
        let day = datePart;
        let date = new Date();
        let endDate = day - date.getDate();
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDate, timePart[0], timePart[1], 0, 0);
        const alertDate = new Date(startDate - new Date(900000));
        if (startDate - Date.now() < 0) return; //TODO change return
        msgEmbed.description = "Starting on: " + startDate.toString();
        const raidLeader = message.author;
        msgEmbed.members = "1. <@" + raidLeader.id + ">\n2.\n3.\n4.\n5.\n6.";
        msgEmbed.standins = "1.\n2.\n3.\n4.\n5.\n6."
        let msg = utils.createMessage(msgEmbed);
        message.channel.send({
            embed: msg,
            files: [{
                attachment: 'images/raid.jpg',
                name: "raid.jpg"
            }]
        }).then(message => {
            message.pin();
            message.react("✅");
            utils.writeFile(message.id, {
                leader: raidLeader.id,
                date: startDate,
                comment: info,
                raid: args[0].toLowerCase(),
                members: [raidLeader.id]
            });
            let timer = alertDate - Date.now();
            setTimeout(() => {
                let members = message.reactions.resolve('✅').users.cache.array().slice(1);
                members.push(raidLeader);
                forEach(members, member => {
                    console.log("sending message to raid member " + member.username);
                    const leader = message.embeds[0].fields[0].value.split('\n')[0];
                    const users = members.filter(user => "1. " + user.username !== leader);
                    const msgMembers = users.splice(1, 6);
                    const msgStandin = users.splice(7);
                    let index = 2;
                    let confirmed = msgMembers.map((user) => {
                        return `${index++}. <@${user.id}>`;
                    });
                    for (; index < 7; index++) {
                        confirmed.push(`${index}.`);
                    }
                    index = 1;
                    let waiting = msgStandin.map((user) => {
                        return `${index++}. <@${user.id}>`;
                    });
                    for (; index < 7; index++) {
                        waiting.push(`${index}.`);
                    }
                    let msgEmbed = {};
                    msgEmbed.title = "Raid is about to start: " + message.embeds[0].title;
                    msgEmbed.description = message.embeds[0].description;
                    msgEmbed.members = `${leader}\n${confirmed.join('\n')}`;
                    msgEmbed.standins = `${waiting.join('\n')}`;
                    msgEmbed.color = 0x7978c7;
                    msgEmbed.footer = "This is a scheduled notice for a raid starting in 15 minutes.";
                    let msg = utils.createMessage(msgEmbed);
                    member.send({
                        embed: msg,
                        files: [{
                            attachment: 'images/raid.jpg',
                            name: "raid.jpg"
                        }]
                    }).catch(err => console.log(err));
                });
            }, timer);
        });
    },
    reacted(message, reactUser) {
        if (reactUser.bot) return;
        const emoji = message._emoji.name;
        if (emoji !== "✅") return;
        const leader = message.message.embeds[0].fields[0].value.split('\n')[0];
        if (reactUser.id == leader) return;
        const users = message.users.cache.array().filter(user => "1. <@"+user.id+">" !== leader);
        const members = users.splice(1, 6);
        const standin = users.splice(7);
        let index = 2;
        let confirmed = members.map((u) => {
            return `${index++}. <@${u.id}>`;
        });
        for (; index < 7; index++) {
            confirmed.push(`${index}.`);
        }
        index = 1;
        let waiting = standin.map((u) => {
            return `${index++}. <@${u.id}>`;
        });
        for (; index < 7; index++) {
            waiting.push(`${index}.`);
        }
        let msgEmbed = {};
        msgEmbed.title = message.message.embeds[0].title;
        msgEmbed.description = message.message.embeds[0].description;
        msgEmbed.members = `${leader}\n${confirmed.join('\n')}`;
        msgEmbed.standins = `${waiting.join('\n')}`;
        let msg = utils.createMessage(msgEmbed);
        message.message.edit({ embed: msg });
        let messageFile = utils.readFile(message.message.id);
        utils.writeFile(message.message.id, {
            leader: messageFile.leader,
            date: messageFile.date,
            comment: messageFile.comment,
            raid: messageFile.raid,
            members: [messageFile.leader].concat(users.map(user => user.id))
        });
    }
};