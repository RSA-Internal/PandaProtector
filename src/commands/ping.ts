import type { Command } from "../types/command";
import { getState } from "../store/state";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: interaction => {
		const start = Date.now();

		interaction
			.reply({
				content: "Pinging...",
				ephemeral: command.shouldBeEphemeral(interaction),
			})
			.then(() =>
				interaction.editReply(
					`Websocket heartbeat: ${getState().client.ws.ping}ms\nRoundtrip latency: ${Date.now() - start}ms`
				)
			)
			.catch(console.error.bind(console));
	},
};

export default command;
