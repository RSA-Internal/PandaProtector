const { SlashCommand } = require('slash-create');
const helper = require('../util/helper');

module.exports = class ReportCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            "name": "report",
            "description": "Report a user to staff",
            "options": [
                {
                "type": 6,
                "name": "user",
                "description": "This is the user to be reported.",
                "default": false,
                "required": true
                },
                {
                "type": 3,
                "name": "reason",
                "description": "This is the reason for reporting the user",
                "default": false,
                "required": true
                }
            ],
            guildIDs: helper.useGuild()
        });
        this.filePath = __filename;
        console.log(`Loaded ${this.commandName}`);
    }

    async run(ctx) {
        let Client = helper.getClient();

        let guild = await Client.guilds.resolve(helper.useGuild());
        let channel = await Client.channels.resolve(helper.useRequestChannelId());

        let author = ctx.member.id;
        let user = ctx.options.user;
        let reason = ctx.options.reason;
        let channelID = ctx.channelID;

        if (author === user) {
            await ctx.send('You can not report yourself. If you\'re breaking the rules, please leave.', {
                ephemeral: true
            })
        } else {
            let origin = await Client.channels.resolve(channelID);

            if (reason.length <= 15 || reason.split(" ").lengt - 1 < 3) {
                await ctx.send('Please provide a longer reason to report someone.', {
                    ephemeral: true
                })
            } else {
                let staffMembers = guild.roles.resolve(helper.staffId()).members.filter(member => member.presence.status == 'online' || member.presence.status == 'idle');
                let staffMentions = "";
    
                staffMembers.each(member => staffMentions = `${staffMentions} ${member},`);
    
                await origin.send(`<@${user}> has been reported.`, {
                    disableMemntions: true
                }).then(message => {
                    channel.send(`${staffMentions}\n\n<@${author}> is reporting <@${user}> in <#${channelID}> with reason: ${reason}.\n\nJump Link: <${message.url}>`);
                })
    
                await ctx.send(`You have reported <@${user}> for \`${reason}\`!`, {
                    allowedMentions: {
                        everyone: false,
                        roles: false,
                        users: false
                    },
                    ephemeral: true
                });   
            }
        }
    }
}