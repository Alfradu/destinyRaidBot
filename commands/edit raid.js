module.exports = {
    name: 'display',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['disp', 'raiddisp'],
    usage: '<optional arg1 user mention>',
    cooldown: 1,
    execute(message, args) {
        //TODO: fetch all active raids
        //TODO: fetch raids for argument mention
        message.author.send("list of all active raids here");
    },
};