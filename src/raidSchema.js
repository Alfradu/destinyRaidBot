const mongoose = require('mongoose');

const raidSchema = new mongoose.Schema({
  id: String,
  guildid: String,
  channelid: String,
  leader: String,
  date: { type: Date, default: Date.now },
  reminderdate: { type: Date, default: Date.now-150000 },
  comment: String,
  raid: String,
  active: Boolean,
  members: [{
    id: Number,
    userId: String,
    team: Number
}]
});
const RaidModel = mongoose.model('Raid', raidSchema);

function createRaidModel(raid){
  var raidmodel = new RaidModel({
    id: raid.id,
    guildid: raid.guildid,
    channelid: raid.channelid,
    leader: raid.leader,
    date: raid.date,
    reminderdate: raid.reminderdate,
    comment: raid.comment,
    raid: raid.raid,
    active: raid.active,
    members: raid.members
  });

  return raidmodel;
}

function updateRaidModel(raidModel, raid){
  var raidmodel = new RaidModel({
    id: raid.id,
    guildid: raid.guildid,
    channelid: raid.channelid,
    leader: raid.leader,
    date: raid.date,
    reminderdate: raid.reminderdate,
    comment: raid.comment,
    raid: raid.raid,
    active: raid.active,
    members: raid.members
  });

  return raidmodel;
}
module.exports = {
  createRaidModel,
  updateRaidModel,
  RaidModel
} 