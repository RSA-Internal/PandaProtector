const { channelRequestId, roleStaffId } = require('../../config.json');

module.exports = {
    name: 'request',
    description: 'Request any online staff members to the current channel',
    cooldown: 30,
    usage: '<reason>',
    guildOnly: true,
    execute(message, args) {
        const guild = message.guild;
        const channelLocation = message.channel;
        const channel = guild.channels.resolve(channelRequestId);
        const reason = args.join(' ');
        const author = message.author

        if (reason.length <= 2) {
            message.reply("Please provide a better reason to summon staff.");
            return;
        }

        if (channel) {
            let staffMembers = guild.roles.resolve(roleStaffId).members.filter(member => member.presence.status == 'online' || member.presence.status == 'idle');
            let staffMentions = "";

            staffMembers.each(member => staffMentions = `${staffMentions} ${member},`);

            channel.send(`${staffMentions}\n\n${author} has request a mod to ${channelLocation} with reason: ${reason}.`);
            message.reply(`Notified ${staffMembers.size} staff.`);
            return;
        }
    },
};