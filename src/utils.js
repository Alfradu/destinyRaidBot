const cloneDeep = require('lodash/fp/cloneDeep');
const fs = require('fs');
const path = require('path');
const { forEach } = require('lodash');
const raids = {
    "vog": ["Vault of Glass", "raid.jpg"],
    "gos": ["Garden of Salvation", "gos.png"],
    "sotp": ["Scourge of the Past", "sotp.png"],
    "lw": ["Last Wish", "dream.png"],
    "levi": ["Leviathan", "levi.png"],
    "cos": ["Crown of Sorrow", "levi.png"],
    "eow": ["Eater of Worlds", "levi.png"],
    "sos": ["Spire of Stars", "levi.png"]
};
const reacts = ['✅', '❓', '❎'];
const dbFolderPath = path.join(__dirname, '_db');

const coreEmbed = {
    color: 0x7adc39,
    title: 'Raid',
    description: 'Some description here',
    thumbnail: {
        url: 'attachment://raid.jpg',
    },
    fields: [
        {
            name: 'Members',
            value: '1. \n2. \n3. \n4. \n5. \n6.',
            inline: true,
        },
        {
            name: 'Standins',
            value: 'none.',
            inline: true,
        },
    ],
    footer: {
        text:
            `A reminder will be sent out 15 minutes before raid start to all fireteam members.
Press the checkmark below to sign up for the raid.
Press the questionmark below to sign up as a standin for the raid.`
    },
};

module.exports = {
    raids: raids,
    reacts: reacts,
    archiveRaid(message) {
        message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        message.unpin();
        fs.unlink(`${dbFolderPath}/${message.channel.id}-${message.id}`, (err) => {
            if (err) throw err;
            let embeds = message.embeds[0];
            embeds.title = "Raid listing archived: " + embeds.title;
            embeds.color = 0xdc3939;
            embeds.thumbnail = {};
            embeds.thumbnail.url = 'attachment://raid.jpg';
            message.edit({ embed: embeds });
            console.log('archived message and deleted local log ' + message.id);
        });
    },
    //todo: change from timeout to check every minute
    //todo: timezones?
    activateRaid(message, startDate) {
        const alertDate = new Date(startDate - new Date(900000));
        if (alertDate > Date.now()) {
            setTimeout(() => {
                let messageFile = module.exports.readFile(message);
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
                msgEmbed.title = "Raid is about to start - " + messageFile.raid;
                msgEmbed.description = message.embeds[0].description;
                msgEmbed.members = `${confirmed.join('\n')}`;
                msgEmbed.image = message.embeds[0].thumbnail.url;
                msgEmbed.thumbnail = {};
                msgEmbed.thumbnail.url = 'attachment://raid.jpg';
                if (waiting.length > 0) msgEmbed.standins = `${waiting.join('\n')}`;
                msgEmbed.color = 0x7978c7;
                msgEmbed.footer = "This is a scheduled notice for a raid starting in 15 minutes.";
                let msg = module.exports.createMessage(msgEmbed);
                forEach(members, member => {
                    let user = message.channel.guild.members.cache.get(member.userID);
                    console.log("sending message to raid member " + user.username);
                    user.send({
                        embed: msg
                    }).catch(err => console.log(err));
                });
            }, alertDate - Date.now());
        }
        setTimeout(() => {
            module.exports.archiveRaid(message);
        }, startDate - Date.now());
        console.log('activated times for message ' + message.id);
    },
    createMessage(input) {
        let cloneEmbed = cloneDeep(coreEmbed);
        if (input.color) cloneEmbed.color = input.color;
        if (input.title) cloneEmbed.title = input.title;
        if (input.description) cloneEmbed.description = input.description;
        if (input.image) cloneEmbed.thumbnail.url = input.image;
        if (input.members) cloneEmbed.fields[0].value = input.members;
        if (input.standins) cloneEmbed.fields[1].value = input.standins;
        if (input.footer) cloneEmbed.footer.text = input.footer;
        return cloneEmbed;
    },
    messageExists(message) {
        return fs.existsSync(`${dbFolderPath}/${message.channel.id}-${message.id}`);
    },
    //TODO handle with db
    readFile(message) {
        if (!fs.existsSync(`${dbFolderPath}/${message.channel.id}-${message.id}`)) return;
        let file = fs.readFileSync(`${dbFolderPath}/${message.channel.id}-${message.id}`, 'utf8');
        return JSON.parse(file);
    },
    //TODO handle with db
    writeFile(message, input) {
        fs.writeFile(`${dbFolderPath}/${message.channel.id}-${message.id}`, JSON.stringify(input), (err) => {
            if (err) throw err;
        });
    },
    debug(input) {
        console.log("########################");
        console.log(input);
        console.log("########################");
    }
};