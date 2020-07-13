const cloneDeep = require('lodash/fp/cloneDeep');
const coreEmbed = {
    color: 0x0099ff,
    title: 'Raid ',
    url: 'https://discord.js.org',
    author: {
        name: 'Some name',
        icon_url: 'https://i.imgur.com/wSTFkRM.png',
        url: 'https://discord.js.org',
    },
    description: 'Some description here',
    thumbnail: {
        url: 'https://i.imgur.com/wSTFkRM.png',
    },
    fields: [
        {
            name: 'Members',
            value: '1. \n2. \n3. \n4. \n5. \n6.',
            inline: true,
        },
        {
            name: 'Standins',
            value: 'none atm',
            inline: true,
        },
    ],
    image: {
        url: 'https://i.imgur.com/wSTFkRM.png',
    },
    timestamp: new Date(),
    footer: {
        text: 'A reminder will be sent out 15 minutes before raid start to all members.',
        icon_url: 'https://i.imgur.com/wSTFkRM.png',
    },
};

module.exports = {
    name: 'raid',
    aliases: ['r'],
    args: true,
    description: 'Create a listing for a raid.',
    cooldown: 1,
    execute(message, args) {
        let exampleEmbed = cloneDeep(coreEmbed);
        //raid name: GoS SotP Levi LW CoS EoW SoS
        args[0]

        //raid time: 
        args[1]
        exampleEmbed.fields[0].value = "1. "+message.author.username;
        message.channel.send({ embed: exampleEmbed }).then(message => {
            message.react("✅");
        });
        //TODO: save msg id to something
    },
    reacted(message) {
        console.log(message);
        const emoji = message._emoji.name;
        if (emoji !== "✅") return;
        const leader = message.message.embeds[0].fields[0].value.split('\n')[0];
        const users = message.users.cache.array().filter(user => "1. "+user.username !== leader);
        console.log('#############################');
        console.log(users);
        console.log('#############################');
        const members = users.splice(1, 6);
        const standin = users.splice(7);
        console.log('#############################');
        console.log(message.message.embeds);
        console.log('#############################');
        let index = 2;
        let confirmed = members.map((user) => {
            return `${index++}. ${user.username}`;
        });
        for(;index < 7; index++) {
            confirmed.push(`${index}.`);
        }
        index = 1;
        let waiting = standin.map((user) => {
            return `${index++}. ${user.username}`;
        });
        for(;index < 7; index++) {
            waiting.push(`${index}.`);
        }
        let exampleEmbed = cloneDeep(coreEmbed);
        exampleEmbed.fields[0].value = `${leader}\n${confirmed.join('\n')}`;
        exampleEmbed.fields[1].value = `${waiting.join('\n')}`;
        console.log('#############################');
        console.log(exampleEmbed);
        console.log('#############################');
        message.message.edit({ embed : exampleEmbed });
    }
};