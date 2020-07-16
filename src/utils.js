const cloneDeep = require('lodash/fp/cloneDeep');
const fs = require('fs');
const path = require('path');
const { forEach } = require('lodash');

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
        text: 'A reminder will be sent out 15 minutes before raid start to all members.\n Press the green checkmark below to sign up for the raid.'
    },
};

module.exports = {
    archiveRaid(message) {
        message.unpin();
        fs.unlink(`${dbFolderPath}/${message.id}`, (err) => {
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
    activateRaid(message, rLeader, startDate) {
        const alertDate = new Date(startDate - new Date(900000));
        if (alertDate > Date.now()) {
            setTimeout(() => {
                let members = message.reactions.resolve('✅').users.cache.array().slice(1);
                members.push(rLeader);
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
                    msgEmbed.title = "Raid is about to start - " + message.embeds[0].title;
                    msgEmbed.description = message.embeds[0].description;
                    msgEmbed.members = `${leader}\n${confirmed.join('\n')}`;
                    msgEmbed.standins = `${waiting.join('\n')}`;
                    msgEmbed.color = 0x7978c7;
                    msgEmbed.footer = "This is a scheduled notice for a raid starting in 15 minutes.";
                    let msg = module.exports.createMessage(msgEmbed);
                    member.send({
                        embed: msg,
                        files: [{
                            attachment: './src/images/raid.jpg',
                            name: "raid.jpg"
                        }]
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
    messageExists(id) {
        return fs.existsSync(`${dbFolderPath}/${id}`);
    },
    //TODO handle with db
    readFile(id) {
        if (!fs.existsSync(`${dbFolderPath}/${id}`)) return;
        let file = fs.readFileSync(`${dbFolderPath}/${id}`, 'utf8');
        return JSON.parse(file);
    },
    //TODO handle with db
    writeFile(id, input) {
        fs.writeFile(`${dbFolderPath}/${id}`, JSON.stringify(input), (err) => {
            if (err) throw err;
        });
    },
    debug(input) {
        console.log("########################");
        console.log(input);
        console.log("########################");
    }
};