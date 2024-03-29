const utils = require('../utils.js');

const foreach = async (data, files, message, raid) => {
    let c = 0;
    for (const fileName of files) {
        const fileIds = fileName.split('-');
        if (fileIds[0] === message.channel.guild.id) {
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

function execute(message, args) {
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

module.exports = {
    name: 'display',
    description: 'List all active raid listings for this channel.',
    aliases: ['disp', 'raiddisp', 'd'],
    usage: '<optional arg1 raid>',
    guildOnly: true,
    cooldown: 1,
    execute
};