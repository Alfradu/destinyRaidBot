const utils = require('../utils.js');
const { get } = require('lodash');

const foreach = async (data, files, message, raid) => {
    let c = 0;
    for (const fileName of files) {
        let fileIds = fileName.split('-');
        let ch = await message.channel.guild.channels.cache.get(fileIds[0]);
        let guild = ch.guild.id === message.channel.guild.id;
        if (guild) {
            let file = utils.readFileName(fileName);
            if (file.raid == raid || !raid) {
                let pos = '';
                if (file.members.length < 5) {
                    pos = `${file.members.length}/6 members`;
                } else {
                    pos = `Raid team full`;
                }
                let msgRow = `${utils.raids[file.raid][0]} -- Leader: <@${file.leader}> -- ${pos}`;
                data.push(msgRow);
                c+=1;
            }
        }
    }
    console.log(`displaying ${c} raid listings`);
    if (c < 1){
        message.channel.send('Could not find any listings for that raid. Why not create one? \n *!raid <arg1 raid name> <arg2 time dd hh:mm> <arg3 additional info>*');
    } else {
        data.push('\n See the pinned messages for active raid listings.');
        message.channel.send(data, { split: true });
    }
}
module.exports = {
    name: 'display',
    description: 'List all active raid listings for this channel.',
    aliases: ['disp', 'raiddisp', 'd'],
    usage: '<optional arg1 raid>',
    cooldown: 1,
    execute(message, args) {
        const data = [];
        const files = utils.getAllFiles();

        if (!args.length) {
            data.push('Here\'s a list of all the active raid listings:');
            foreach(data, files, message);
        } else {
            let r = utils.raids[args[0]] ? utils.raids[args[0]][0] : args[0];
            data.push('Here\'s a list of all the active raids for: ' + r + ' :');
            foreach(data, files, message, args[0]);
        }
    }
};