import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: (state, message) => !!message.member?.roles.resolve(state.developerRoleId),
	parseArguments: () => [],
	handler: state => {
		state.client.destroy();
		process.exit();
	},
};

export default command;
