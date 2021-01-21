const utils = require('../utils.js');

module.exports = {
    name: 'display',
    description: 'List all active raid listings for this channel.',
    aliases: ['disp', 'raiddisp', 'd'],
    usage: '<optional arg1 raid>',
    cooldown: 1,
    execute(message, args) {
        const data = [];
        const files = utils.getAllFiles();

        const foreach = async (raid) => {
            let c = 0
            for (const fileName of files) {
                let fileIds = fileName.split('-');
                let ch = await message.channel.guild.channels.cache.find(x => x.id == fileIds[0]);
                if (ch.guild.id == message.channel.guild.id) {
                    let msg = await ch.messages.fetch(fileIds[1], true);
                    let file = utils.readFile(msg);
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
            
            if (c < 1){
                message.channel.send('Could not find any listings for that raid. Why not create one? \n *!raid <arg1 raid name> <arg2 time dd hh:mm> <arg3 additional info>*');
            } else {
                data.push('\n See the pinned messages for active raid listings.');
                message.channel.send(data, { split: true });
            }
        }

        if (!args.length) {
            data.push('Here\'s a list of all the active raid listings:');
            foreach();
        } else {
            let r = utils.raids[args[0]] ? utils.raids[args[0]][0] : args[0];
            data.push('Here\'s a list of all the active raids for: ' + r + ' :');
            foreach(args[0]);
        }
    }
};