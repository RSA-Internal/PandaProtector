import type { Command } from "../command";
import { log, logLevels } from "../logger";

const command: Command = {
	name: "debug",
	description: "404 - description not found.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		interaction
			.reply("This command helps with intentional debug testing.")
			.then(() => {
				log("This is a forced debug message.", logLevels.debug, state, interaction, true);
				log("This is a debugMode message.", logLevels.debug, state, interaction, false);
				log("This is an error message intended for debug.", logLevels.error, state, interaction, true);
				throw new Error("This is intended error that has been thrown.");
			})
			.catch(err => log(err, logLevels.error, state, interaction, true));
	},
};

export default command;
