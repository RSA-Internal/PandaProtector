import type { Command } from "../types/command";
import { log } from "../logger";
import { getState } from "../store/state";

const command: Command = {
	name: "debug",
	description: "Test logger.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: interaction => {
		interaction
			.reply({
				content: "This command helps with intentional debug testing.",
				ephemeral: command.shouldBeEphemeral(interaction),
			})
			.then(() => {
				log("This is an info message.", "info");
				log("This is an warn message.", "warn");
				log("This is an error message.", "error");
				log("This is an debug message.", "debug");
				throw new Error("This is intended error that has been thrown.");
			})
			.catch(err => log(err, "error"));
	},
};

export default command;
