const cloneDeep = require('lodash/fp/cloneDeep');
const {raidTemplate} = require('./template.js');
const path = require('path');
const raids = {
    "vog" : ["Vault of Glass", "raid.jpg"],
    "gos" : ["Garden of Salvation", "gos.png"],
    "sotp": ["Scourge of the Past", "sotp.png"],
    "lw"  : ["Last Wish", "dream.png"],
    "levi": ["Leviathan", "levi.png"],
    "cos" : ["Crown of Sorrow", "levi.png"],
    "eow" : ["Eater of Worlds", "levi.png"],
    "sos" : ["Spire of Stars", "levi.png"],
    "dsc" : ["Deep Stone Crypt", "dsc.png"]
};
const teams = { "MEMBERS":0, "STANDINS":1, "UNAVAILABLE":2}
const reacts = ['✅', '❓', '❎'];

module.exports = {
    raids: raids,
    reacts: reacts,
    teams: teams,
    createMessage(input) {
        let cloneEmbed = cloneDeep(raidTemplate);
        if (input.color) cloneEmbed.color = input.color;
        if (input.title) cloneEmbed.title = input.title;
        if (input.description) cloneEmbed.description = input.description;
        if (input.image) cloneEmbed.thumbnail.url = input.image;
        if (input.members) cloneEmbed.fields[0].value = input.members;
        if (input.standins) cloneEmbed.fields[1].value = input.standins;
        if (input.footer) cloneEmbed.footer.text = input.footer;
        return cloneEmbed;
    },
    debug(input) {
        var date = new Date(Date.now());
        console.log(date.getHours()+':'+date.getMinutes() + ' :: ' + input);
    }
};