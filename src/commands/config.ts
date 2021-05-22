import { GuildMember, MessageEmbed } from "discord.js";
import { writeFile } from "fs";
import type { Command } from "../command";

const command: Command = {
	name: "config",
	description: "Gets and updates config values, do not specify a name to list all config entries.",
	options: [
		{
			type: "STRING",
			name: "name",
			description: "The config name (case-sensitive).",
			required: false,
		},
		{
			type: "STRING",
			name: "value",
			description: "The new value for the config.",
			required: false,
		},
	],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.developerRoleId),
	shouldBeEphemeral: () => true,
	handler: (state, interaction, args) => {
		const name = args[0].value as string;
		const value = args[1].value as string;
		const { config } = state;

		if (name) {
			// Get or update config.
			if (name in config) {
				if (value) {
					// Update config value.
					config[name as keyof typeof config] = value;

					writeFile(state.configPath, JSON.stringify(config), err => {
						if (!err) {
							interaction
								.reply(`Updated config ${name}.`, {
									ephemeral: command.shouldBeEphemeral(state, interaction),
								})
								.catch(console.error.bind(console));
						} else {
							console.error(err);

							interaction
								.reply(`Updated config ${name}, but could not save to file: ${err.message}.`, {
									ephemeral: command.shouldBeEphemeral(state, interaction),
								})
								.catch(console.error.bind(console));
						}
					});
				} else {
					// Get config value.
					interaction
						.reply(`${name}: ${config[name as keyof typeof config]}`, { ephemeral: true })
						.catch(console.error.bind(console));
				}
			} else {
				interaction
					.reply("Unknown config.", { ephemeral: command.shouldBeEphemeral(state, interaction) })
					.catch(console.error.bind(console));
			}
		} else {
			// List config entries.
			interaction
				.reply(
					new MessageEmbed({
						title: "Config",
						fields: Object.entries(config).map(([name, value]) => ({
							name,
							value: value as string,
							inline: true,
						})),
					})
				)
				.catch(console.error.bind(console));
		}
	},
};

export default command;
