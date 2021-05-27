import type { Command } from "../command";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		const start = Date.now();

		interaction
			.reply("Pinging...", { ephemeral: command.shouldBeEphemeral(state, interaction) })
			.then(() =>
				interaction.editReply(
					`Websocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip latency: ${Date.now() - start}ms`
				)
			)
			.catch(console.error.bind(console));
	},
};

export default command;
