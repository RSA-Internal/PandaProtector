import type { GuildMember } from "discord.js";
import type { Command } from "../command";
import { log, logLevels } from "../logger";

const command: Command = {
	name: "debug",
	description: "Test logger.",
	options: [],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.developerRoleId),
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction) => {
		interaction
			.reply("This command helps with intentional debug testing.")
			.then(() => {
				log("This is an info message.", logLevels.info);
				log("This is an warn message.", logLevels.warn);
				log("This is an error message.", logLevels.error);
				log("This is an debug message.", logLevels.debug);
				throw new Error("This is intended error that has been thrown.");
			})
			.catch(err => log(err, logLevels.error));
	},
};

export default command;
