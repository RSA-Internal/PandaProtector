import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	shouldBeEphemeral: () => false,
	handler: state => {
		state.client.destroy();
		process.exit();
	},
};

export default command;
