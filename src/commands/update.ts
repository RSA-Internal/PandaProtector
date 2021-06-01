import type { GuildMember } from "discord.js";
import type { Command } from "../command";
import { getState } from "../store/state";

const command: Command = {
	name: "update",
	description: "Shutdowns the bot for an update.",
	options: [],
	hasPermission: interaction =>
		(interaction.member as GuildMember).roles.cache.has(getState().config.developerRoleId),
	shouldBeEphemeral: () => false,
	handler: state => {
		state.client.destroy();
		process.exit();
	},
};

export default command;
