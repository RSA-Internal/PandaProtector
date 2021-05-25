import type { GuildMember } from "discord.js";
import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.developerRoleId),
	shouldBeEphemeral: () => false,
	handler: state => {
		state.client.destroy();
		process.exit();
	},
};

export default command;
