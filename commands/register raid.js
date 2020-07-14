const fs = require('fs');
const cloneDeep = require('lodash/fp/cloneDeep');

const raids =  {
    "vog" : "Vault of Glass",
    "gos" : "Garden of Salvation", 
    "sotp" : "Scourge of the Past", 
    "lw" : "Last Wish", 
    "levi" : "Leviathan", 
    "cos" : "Crown of Sorrow", 
    "eow" : "Eater of Worlds", 
    "sos" : "Spire of Stars"
};

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
            value: 'none atm',
            inline: true,
        },
    ],
    footer: {
        text: 'A reminder will be sent out 15 minutes before raid start to all members.'
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
        //raid name: VoG GoS SotP LW Levi CoS EoW SoS
        if (!raids[args[0].toLowerCase()]) return;
        const info = args.splice(3).join(" ");
        exampleEmbed.title = raids[args[0].toLowerCase()] + " : " + info;
        //raid time: 
        //dd hh:mm
        let datePart = args[1];
        let timePart = args[2].split(':');
        if (!datePart || !timePart[0] || !timePart[1]) return;
        let day = datePart;
        let date = new Date();
        let endDate = day-date.getDate();
        const startDate = new Date(
            date.getFullYear(),date.getMonth(),date.getDate() + endDate, timePart[0], timePart[1], 0, 0
        );
        exampleEmbed.description = "Starting on: " + startDate.toString();
        exampleEmbed.fields[0].value = "1. <@" + message.author.id + ">";
        console.log(exampleEmbed);
        message.channel.send({
            embed: exampleEmbed,
            files: [{
                attachment: 'images/raid.jpg',
                name: "raid.jpg"
            }]
        }).then(message => {
            message.react("✅");
            const data = {
                leader: message.author.id,
                date: startDate,
                comment: info,
                raid: args[0].toLowerCase()
            };
            fs.writeFile(`./_db/${message.id}`, JSON.stringify(data), (err) => { 
                 if(err) {
                     throw err;
                 }
            });
        });
        //TODO: save msg id to something
    },
    reacted(message) {
        console.log(message);
        const emoji = message._emoji.name;
        if (emoji !== "✅") return;
        const leader = message.message.embeds[0].fields[0].value.split('\n')[0];
        const users = message.users.cache.array().filter(user => "1. " + user.username !== leader);
        // console.log('#############################');
        // console.log(users);
        // console.log('#############################');
        const members = users.splice(1, 6);
        const standin = users.splice(7);
        // console.log('#############################');
        // console.log(message.message.embeds);
        // console.log('#############################');
        let index = 2;
        let confirmed = members.map((user) => {
            return `${index++}. <@${user.id}>`;
        });
        for (; index < 7; index++) {
            confirmed.push(`${index}.`);
        }
        index = 1;
        let waiting = standin.map((user) => {
            return `${index++}. <@${user.id}>`;
        });
        for (; index < 7; index++) {
            waiting.push(`${index}.`);
        }
        let exampleEmbed = cloneDeep(coreEmbed);
        exampleEmbed.title = message.message.embeds[0].title;
        exampleEmbed.description = message.message.embeds[0].description;
        exampleEmbed.fields[0].value = `${leader}\n${confirmed.join('\n')}`;
        exampleEmbed.fields[1].value = `${waiting.join('\n')}`;
        // console.log('#############################');
        // console.log(exampleEmbed);
        // console.log('#############################');
        message.message.edit({ embed: exampleEmbed });
    }
};