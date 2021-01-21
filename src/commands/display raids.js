const utils = require('../utils.js');
const fs = require('fs');

module.exports = {
    name: 'display',
    description: 'List all active raid listings for this channel.',
    aliases: ['disp', 'raiddisp', 'd'],
    usage: '<optional arg1 user tag (user#1234)>',
    cooldown: 1,
    execute(message, args) {
        let data = [];
        const files = fs.readdirSync(utils.getFolderPath);

        if (!args.length) {
            data.push('Here\'s a list of all the active raid listings:');
        } else {
            let user = message.channel.guild.members.fetch({cache : false}).then(members=>members.find(member=>member.user.tag === message.author.tag))
            data.push('Here\'s a list of all the active raid listings from <@' + user +'> :');
        }
        forEach(files, async (fileName) => {
            let fileIds = filename.split('-');
            let ch = await client.channels.fetch(fileIds[0]);
            if (ch.guild.id == message.channel.guild.id) {
                let msg = await ch.messages.fetch(fileIds[1], true);
                let file = utils.readFile(msg);
                let pos = '';
                if (file.members.length < 5){
                    pos = `${file.members.length} / 6 members`;
                } else {
                    pos = `raid team full`;
                }
                let msgRow = `**Raid**: ${file.raid} :: <@${file.leader}> :: `;
                //raid - date - leader - count
                console.log(msgRow);
                data.push(msgRow);
            }
        });
        message.channel.send(data, { split: true });
    }
};