import type { Command } from "../command";

const command: Command = {
	name: "uptime",
	description: "Displays bot uptime.",
	options: [],
	hasPermission: () => true,
	parseArguments: () => [],
	handler: (_, message) => {
		message.reply(`Uptime: ${Math.floor(process.uptime())} seconds.`).catch(console.error.bind(console));
	},
};

export default command;
