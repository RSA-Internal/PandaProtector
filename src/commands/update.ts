import type { GuildMember, TextChannel } from "discord.js";
import type { Command } from "../command";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.developerRoleId),
	shouldBeEphemeral: (state, interaction) =>
		(interaction.channel as TextChannel).parent?.id !== state.config.staffCategoryId,
	handler: state => {
		state.client.destroy();
		process.exit();
	},
};

export default command;
