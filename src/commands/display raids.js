const utils = require('../utils.js');
const { forEach } = require('lodash');

module.exports = {
    name: 'display',
    description: 'List all active raid listings for this channel.',
    aliases: ['disp', 'raiddisp', 'd'],
    usage: '<optional arg1 user tag (user#1234)>',
    cooldown: 1,
    execute(message, args) {
        const data = [];
        const files = utils.getAllFiles();

        if (!args.length) {
            data.push('Here\'s a list of all the active raid listings:');
        } else {
            let user = message.channel.guild.members.fetch({ cache: false }).then(members => members.find(member => member.user.tag === message.author.tag))
            data.push('Here\'s a list of all the active raid listings from <@' + user + '> :');
        }

        const foreach = async () => {
            for (const fileName of files) {
                let fileIds = fileName.split('-');
                let ch = await message.channel.guild.channels.cache.find(x => x.id == fileIds[0]);
                if (ch.guild.id == message.channel.guild.id) {
                    let msg = await ch.messages.fetch(fileIds[1], true);
                    let file = utils.readFile(msg);
                    let pos = '';
                    if (file.members.length < 5) {
                        pos = `${file.members.length}/6 members`;
                    } else {
                        pos = `Raid team full`;
                    }
                    let msgRow = `${utils.raids[file.raid][0]} -- Leader: <@${file.leader}> -- ${pos}`;
                    data.push(msgRow);
                }
            }
            data.push('\n See the pinned messages for active raid listings.');
            message.channel.send(data, { split: true });
        }
        foreach();
    }
};