const cloneDeep = require('lodash/fp/cloneDeep');
const fs = require('fs');
const coreEmbed = {
    color: 0x0099ff,
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
        text: 'A reminder will be sent out 15 minutes before raid start to all members.'
    },
};

module.exports = {
    stringToArr(string) {
        return [];
    },
    deleteRaid(message) {

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
    //TODO handle with db
    readFile(id, input) {

    },
    //TODO handle with db
    writeFile(id, input) {
        fs.writeFile(`./_db/${id}`, JSON.stringify(input), (err) => {
            if (err) {
                throw err;
            }
        });
    }
};