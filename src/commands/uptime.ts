import type { Command } from "../types/command";
import { getState } from "../store/state";

const command: Command = {
	name: "uptime",
	description: "Displays bot uptime.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: interaction => {
		const uptime = process.uptime();
		const seconds = (Math.floor(uptime) % 60).toString().padStart(2, "0");
		const minutes = (Math.floor(uptime / 60) % 60).toString().padStart(2, "0");
		const hours = (Math.floor(uptime / 3600) % 24).toString().padStart(2, "0");
		const days = Math.floor(uptime / 86400);

		interaction
			.reply({
				content: `Uptime: ${days} days ${hours}:${minutes}:${seconds}`,
				ephemeral: command.shouldBeEphemeral(interaction),
			})
			.catch(console.error.bind(console));
	},
};

export default command;
