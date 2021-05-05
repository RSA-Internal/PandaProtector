import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: (state, message) => !!message.member?.roles.cache.has(state.config.developerRoleId),
	parseArguments: () => [],
	handler: state => {
		state.discordClient.destroy();
		process.exit();
	},
};

export default command;
