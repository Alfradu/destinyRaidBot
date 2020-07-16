const cloneDeep = require('lodash/fp/cloneDeep');
const fs = require('fs');
const path = require('path');

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
        fs.unlink(`${dbFolderPath}/${message.id}`, (err) => {
            if (err) throw err;
            let embeds = message.embeds[0];
            embeds.title = "Raid listing archived: " + embeds.title;
            embeds.color = 0xdc3939;
            embeds.thumbnail = {};
            embeds.thumbnail.url = 'attachment://raid.jpg';
            message.edit({embed: embeds});
            console.log('successfully archived message and deleted local log '+message.id);
        });
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
    messageExists(id){
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