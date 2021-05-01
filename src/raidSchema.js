const mongoose = require('mongoose');

const raidSchema = new mongoose.Schema({
  id: String,
  guildid: String,
  channelid: String,
  leader: String,
  date: Date,
  reminderdate: Date,
  comment: String,
  raid: String,
  active: Boolean,
  remind: Boolean,
  members: [{
    id: Number,
    userId: String,
    team: Number,
    role: String
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
    remind: raid.remind,
    members: raid.members
  });

  return raidmodel;
}

module.exports = {
  createRaidModel,
  RaidModel
} 