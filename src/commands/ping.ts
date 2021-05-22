import type { Command } from "../command";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => {
		return interaction.channelID != state.config.botChannelId;
	},
	handler: async (state, interaction) => {
		await interaction.reply("Pinging...");
		await interaction.editReply(
			`Websocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip latency: ${
				interaction.createdTimestamp - Date.now()
			}ms`
		);
	},
};

export default command;
