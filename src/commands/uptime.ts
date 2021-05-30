import type { Command } from "../command";

const command: Command = {
	name: "uptime",
	description: "Displays bot uptime.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		const uptime = process.uptime();
		const seconds = (Math.floor(uptime) % 60).toString().padStart(2, "0");
		const minutes = (Math.floor(uptime / 60) % 60).toString().padStart(2, "0");
		const hours = (Math.floor(uptime / 3600) % 60).toString().padStart(2, "0");
		const days = Math.floor(uptime / 86400);

		interaction
			.reply(`Uptime: ${days} days ${hours}:${minutes}:${seconds}`, {
				ephemeral: command.shouldBeEphemeral(state, interaction),
			})
			.catch(console.error.bind(console));
	},
};

export default command;
