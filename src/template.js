const raidTemplate = {
    color: 0x7adc39,
    title: 'Raid',
    description: 'Some description here',
    thumbnail: {
        url: 'attachment://raid.jpg',
    },
    fields: [
        {
            name: 'Members',
            value: '',
            inline: true,
        },
        {
            name: 'Standins',
            value: 'none.',
            inline: true,
        },
    ],
    timestamp: new Date(),
    footer: {
        text:
            `Press any of the reacts below to sign up for the raid.`
    },
};
const allRaidsTemplate = {
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
    raidTemplate
}
