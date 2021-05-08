const utils = require('../utils.js');
const { Raid } = require('../Raid.js');
const db = require('../db.js');

function execute(message, args) {
    //args: 0 : raid, 
    //      1 : date (day@hour:minutes+timezone)
    //      2 : class (T/W/H/F)
    //      3+: info
    //TODO: parse args correctly, divide them by "-" 
    let raidAbbr = args[0].toLowerCase();
    if (!utils.raids[raidAbbr]) throw new Exception();

    let timePart = args[1].split(/[@,:]+/g);
    if (!timePart[0] || !timePart[1] || !timePart[2])  throw new Exception();
    let date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), timePart[0], timePart[1], timePart[2], 0, 0);
    if (startDate < Date.now())  throw new Exception();

    let optionalClass = args[2];
    let infoArgNr = 2;
    if (optionalClass.length == 1) {
        if (!/^[T,W,H,F]$/i.test(optionalClass)) throw new Exception();
        infoArgNr = 3;
        optionalClass = optionalClass.toLowerCase();
    } else {
        optionalClass = 'f';
    }

    let msgEmbed = {};
    const info = args.splice(infoArgNr).join(" ");
    msgEmbed.title = utils.raids[raidAbbr][0] + ". " + info;
    msgEmbed.description = "Starting on: " + startDate.toUTCString();
    const raidLeader = message.author;
    utils.debug('Creating new raid listing for ' + raidLeader.username);
    msgEmbed.members = utils.reacts[optionalClass] + " <@" + raidLeader.id + ">\n2. \n3. \n4. \n5. \n6. ";
    msgEmbed.date = startDate;
    let msg = utils.createMessage(msgEmbed);
    message.channel.send({
        embed: msg,
        files: [{
            attachment: './src/images/' + utils.raids[raidAbbr][1],
            name: "raid.jpg"
        }]
    }).then(async message => {
        await message.react(utils.reacts.w);
        await message.react(utils.reacts.h);
        await message.react(utils.reacts.t);
        await message.react(utils.reacts.f);
        await message.react(utils.reacts['?']);

        message.pin().catch(error => console.error('Failed to pin message', error));
        var raid = new Raid(
            message.id,
            message.channel.guild.id,
            message.channel.id,
            raidLeader.id,
            startDate,
            startDate - 900000,
            info,
            raidAbbr,
            {
                id: 0,
                userId: raidLeader.id,
                team: utils.teams.MEMBERS,
                role: optionalClass
            });
        db.createRaid(raid);
    });
}
async function reacted(reaction, message, reactUser) {
    if (reactUser.bot) return;
    if (Object.values(utils.reacts).find(v => v === reaction) === undefined) return;
    let id = reactUser.id;
    let role = Object.keys(utils.reacts).find(key => utils.reacts[key] === reaction);
    utils.debug(id + " adding react on message " + message.id);
    let messageObject = await db.getRaidFromId(message.id);
    utils.debug(messageObject.members[0].role);
    let users = messageObject.members;
    if (id != messageObject.leader) {
        let t;
        if (users.filter(m => m.userId == id).length > 0) {
            let position = users.indexOf(users.find(m => m.userId == id));
            messageObject.members[position].role = role;
            if (users[position].team == utils.teams.MEMBERS) {
                t = reaction == utils.reacts['?'] ? utils.teams.STANDINS : utils.teams.MEMBERS;
                messageObject.members[position].team = t;
            } else {
                t = users.filter(m => m.team === utils.teams.MEMBERS).length > 5 ? utils.teams.STANDINS : utils.teams.MEMBERS;
                messageObject.members[position].team = t;
                let maxVal = 0;
                for (let i = 0; i < users.length; i++) {
                    if (users[i].id > maxVal) maxVal = users[i].id;
                }
                messageObject.members[position].id = maxVal + 1;
            }
        } else {
            if (reaction != utils.reacts['?']) {
                t = users.filter(m => m.team === utils.teams.MEMBERS).length > 5 ? utils.teams.STANDINS : utils.teams.MEMBERS;
            } else {
                t = utils.teams.STANDINS;
            }
            let newMember = {};
            newMember.userId = id;
            newMember.role = role;
            newMember.team = t;
            let maxVal = 0;
            for (let i = 0; i < users.length; i++) {
                if (users[i].id > maxVal) maxVal = users[i].id;
            }
            newMember.id = maxVal + 1;
            messageObject.members.push(newMember);
        }
        db.updateRaid(messageObject);
    } else if (id == messageObject.leader && reaction == utils.reacts['?']) {
        message.reactions.resolve(utils.reacts['?']).users.remove(id);
        return;
    } else {
        let position = users.indexOf(users.find(m => m.userId == id));
        messageObject.members[position].role = role;
        db.updateRaid(messageObject);
    }
    let members = messageObject.members.filter(m => m.team === utils.teams.MEMBERS);
    members.sort((a, b) => a.id - b.id);
    let standin = messageObject.members.filter(m => m.team === utils.teams.STANDINS);
    standin.sort((a, b) => a.id - b.id);
    let index = 1;
    let confirmed = members.map(member => {
        index++;
        return `${utils.reacts[member.role]} <@${member.userId}>`;
    });
    for (; index < 7; index++) {
        confirmed.push(`${index}.`);
    }
    let waiting = standin.map(member => {
        return `${utils.reacts[member.role]} <@${member.userId}>`;
    });
    let msgEmbed = {};
    msgEmbed.members = `${confirmed.join('\n')}`;
    if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
    msgEmbed.title = message.embeds[0].title;
    msgEmbed.description = message.embeds[0].description;
    let msg = utils.createMessage(msgEmbed);
    message.edit({ embed: msg });
}
async function unreacted(reaction, message, reactUser) {
    if (reactUser.bot) return;
    if (Object.values(utils.reacts).find(v => v === reaction) === undefined) return;
    let id = reactUser.id;
    utils.debug(id + " removing react on message " + message.id);
    let messageObject = await db.getRaidFromId(message.id);
    if (id == messageObject.leader) return;
    let role = Object.keys(utils.reacts).find(key => utils.reacts[key] === reaction);
    let users = messageObject.members;
    let position = users.indexOf(users.find(m => m.userId == id));
    if (position == -1) return;
    if (role != users[position].role) return;
    messageObject.members.splice(position, 1);
    users = messageObject.members;
    if (users.filter(m => m.team === utils.teams.MEMBERS).length < 6 && users.filter(m => m.team === utils.teams.STANDINS && m.role != '?').length > 0) {
        console.log(users.filter(m => m.team === utils.teams.STANDINS && m.role != '?').sort((a, b) => a.id - b.id)[0]);
        let standinPosition = users.indexOf(users.filter(m => m.team === utils.teams.STANDINS && m.role != '?').sort((a, b) => a.id - b.id)[0]);
        console.log(standinPosition);
        if (standinPosition != -1) {
            messageObject.members[standinPosition].team = utils.teams.MEMBERS;
        }
    }
    db.updateRaid(messageObject);
    let members = messageObject.members.filter(m => m.team === utils.teams.MEMBERS);
    members.sort((a, b) => a.id - b.id);
    let standin = messageObject.members.filter(m => m.team === utils.teams.STANDINS);
    standin.sort((a, b) => a.id - b.id);
    let index = 1;
    let confirmed = members.map(member => {
        index++;
        return `${utils.reacts[member.role]} <@${member.userId}>`;
    });
    for (; index < 7; index++) {
        confirmed.push(`${index}.`);
    }
    let waiting = standin.map(member => {
        return `${utils.reacts[member.role]} <@${member.userId}>`;
    });
    let msgEmbed = {};
    msgEmbed.members = `${confirmed.join('\n')}`;
    if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
    msgEmbed.title = message.embeds[0].title;
    msgEmbed.description = message.embeds[0].description;
    let msg = utils.createMessage(msgEmbed);
    message.edit({ embed: msg });
}
module.exports = {
    name: 'raid',
    aliases: ['r', 'register'],
    args: true,
    guildOnly: true,
    description: 'Create a listing for a raid.',
    usage: `<${Object.keys(utils.raids).join('/')}> <dd@hh:mm> <W/T/H/F> <info>`,
    cooldown: 1,
    execute,
    reacted,
    unreacted
};