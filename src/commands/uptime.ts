import type { Command } from "../command";

const command: Command = {
	name: "uptime",
	description: "Displays bot uptime.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		interaction
			.reply(`Uptime: ${Math.floor(process.uptime())} seconds.`, {
				ephemeral: command.shouldBeEphemeral(state, interaction),
			})
			.catch(console.error.bind(console));
	},
};

export default command;
