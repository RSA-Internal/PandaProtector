import { MessageCommand, SlashCommand } from "pandawrapper";

export const uptimeSlashCommand = new SlashCommand("uptime", "Display the bots current uptime.");
uptimeSlashCommand.setCallback(async interaction => {
	const uptime = process.uptime();
	const seconds = (Math.floor(uptime) % 60).toString().padStart(2, "0");
	const minutes = (Math.floor(uptime / 60) % 60).toString().padStart(2, "0");
	const hours = (Math.floor(uptime / 3600) % 24).toString().padStart(2, "0");
	const days = Math.floor(uptime / 86400);

	await interaction.reply(`Uptime: ${days} days ${hours}:${minutes}:${seconds}`);
});

export const uptimeMessageCommand = new MessageCommand("uptime");
uptimeMessageCommand.setCallback(message => {
	const uptime = process.uptime();
	const seconds = (Math.floor(uptime) % 60).toString().padStart(2, "0");
	const minutes = (Math.floor(uptime / 60) % 60).toString().padStart(2, "0");
	const hours = (Math.floor(uptime / 3600) % 24).toString().padStart(2, "0");
	const days = Math.floor(uptime / 86400);

	message.reply(`Uptime: ${days} days ${hours}:${minutes}:${seconds}`).catch(console.error.bind(console));
});
