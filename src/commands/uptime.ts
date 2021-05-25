import type { Command } from "../command";

const command: Command = {
	name: "uptime",
	description: "Displays bot uptime.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		let uptimeInSeconds = process.uptime();
		const uptimeDays = Math.floor(uptimeInSeconds / 86400);
		uptimeInSeconds -= uptimeDays * 86400;
		const uptimeHours = Math.floor(uptimeInSeconds / 3600);
		uptimeInSeconds -= uptimeHours * 3600;
		const uptimeMinutes = Math.floor(uptimeInSeconds / 60);
		const uptimeSeconds = Math.floor(uptimeInSeconds - uptimeMinutes * 60);
		//Output appearance: 1d:12h:30m:30s
		interaction
			.reply(`Uptime: ${uptimeDays}d:${uptimeHours}h:${uptimeMinutes}m:${uptimeSeconds}s.`, {
				ephemeral: command.shouldBeEphemeral(state, interaction),
			})
			.catch(console.error.bind(console));
	},
};

export default command;
