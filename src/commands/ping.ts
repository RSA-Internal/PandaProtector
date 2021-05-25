import type { Command } from "../command";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		interaction
			.reply("Pinging...", { ephemeral: command.shouldBeEphemeral(state, interaction) })
			.catch(console.error.bind(console));
		interaction
			.editReply(
				`Websocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip latency: ${
					interaction.createdTimestamp - Date.now()
				}ms`
			)
			.catch(console.error.bind(console));
	},
};

export default command;
