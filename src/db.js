const mongoose = require('mongoose');
const utils = require('./utils.js');
const { uri } = require('config.json');
const { createRaidModel, RaidModel } = require('./raidSchema.js');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function () { utils.debug('Connected to db'); });

async function createRaid(raid) {
    return await createRaidModel(raid).save();
}
async function updateRaid(update) {
    return await update.save();
}
async function deleteRaid(id) {
    return await RaidModel.findOneAndRemove({ id: id });
}
async function getRaidFromId(id) {
    return await RaidModel.findOne({ id: id });
}
async function getPastRaids() {
    return await RaidModel.find({ date: { $lt: Date.now() } });
}
async function getReminderRaids() {
    return await RaidModel.find({ reminderdate: { $lte: Date.now() }, date: { $gte: Date.now() }, remind: true });
}
module.exports = {
    updateRaid,
    createRaid,
    getRaidFromId,
    getPastRaids,
    getReminderRaids,
    deleteRaid
};