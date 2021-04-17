const mongoose = require('mongoose');
const { createRaidModel, RaidModel } = require('./raidSchema.js');

const uri = "mongodb://localhost:27017/raiddb";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log('*** connected to db ***'); });

async function createRaid(raid) {
    const raidModel = createRaidModel(raid);
    const raidSuccess = await raidModel.save();
    return raidSuccess;
}
async function updateRaid(id, update) {
    var raidSuccess = await RaidModel.findOneAndUpdate({ id: id }, update, { new: true });
    return raidSuccess;
}
async function deleteRaid(id) {
    var raidSuccess = await RaidModel.findOneAndRemove({ id: id });
    return raidSuccess;
}
async function getRaidFromId(id) {
    var raidSuccess = await RaidModel.find({ id: id });
    return raidSuccess;
}
async function getPastRaids() {
    var raidSuccess = await RaidModel.find({ date: { $lt: Date.now() } });
    return raidSuccess;
}
async function getReminderRaids() {
    var raidSuccess = await RaidModel.find({ reminderdate: { $lt: Date.now(), $gt: Date.now() - 150000 } });
    return raidSuccess;
}
module.exports = {
    updateRaid,
    createRaid,
    getRaidFromId,
    getPastRaids,
    getReminderRaids,
    deleteRaid
}; 