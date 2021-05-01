class Raid {
    id;
    guildid;
    channelid;
    leader;
    date;
    reminderdate;
    comment;
    raid;
    active;
    remind;
    members = new Array();
    constructor(id,
        guildid,
        channelid,
        leader,
        date,
        reminderdate,
        comment,
        raid,
        members) {
        this.id = id;
        this.guildid = guildid;
        this.channelid = channelid;
        this.leader = leader;
        this.date = date;
        this.reminderdate = reminderdate;
        this.comment = comment;
        this.raid = raid;
        this.members.push(members);
        this.active = true;
        this.remind = true;
    };
    validateRaid() {
        return true;
    };
}
module.exports = {
    Raid
} 