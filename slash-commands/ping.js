const { SlashCommand } = require('slash-create');
const helper = require('../util/helper');

module.exports = class PingCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'ping',
            description: 'Get latency info of bot.',
            guildIDs: helper.useGuild()
        });
        this.filePath = __filename;
        console.log(`Loaded ${this.commandName}`);
    }

    async run(ctx) {
        let Client = helper.getClient();

        if (helper.shouldBeEphemeral(ctx.channelID)) {
            await ctx.send(`Websocket heartbeat: ${Client.ws.ping}ms\nRoundtrip Latency is uncheckable with ephemeral messages.`, {
                ephemeral: true
            })
        } else {
            ctx.acknowledge(true);
            let channel = Client.channels.resolve(ctx.channelID);

            channel.send('Pinging...').then(sent => {
                sent.edit(`Websocket heartbeat: ${Client.ws.ping}ms\nRoundtrip Latency: ${sent.createdTimestamp - ctx.invokedAt}ms`);
            }); 
        }
    }
}