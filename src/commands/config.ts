import { MessageEmbed } from "discord.js";
import { writeFile } from "fs";
import type { Command } from "../command";
import { ephemeral } from "../ephemeral";
import { defaultArgumentParser } from "../parsers";

const command: Command = {
	name: "config",
	description: "Gets and updates config values, do not specify a name to list all config entries.",
	options: [
		{
			name: "name",
			description: "The config name (case-sensitive).",
			optional: true,
		},
		{
			name: "value",
			description: "The new value for the config.",
			optional: true,
		},
	],
	hasPermission: (state, message) => !!message.member?.roles.cache.has(state.config.developerRoleId),
	parseArguments: defaultArgumentParser,
	handler: (state, message, name, value) => {
		const { config } = state;

		if (name) {
			// Get or update config.
			if (name in config) {
				if (value) {
					// Update config value.
					config[name as keyof typeof config] = value;

					writeFile(state.configPath, JSON.stringify(config), err => {
						if (!err) {
							ephemeral(state, message.reply(`Updated config ${name}.`)).catch(
								console.error.bind(console)
							);
						} else {
							console.error(err);

							ephemeral(
								state,
								message.reply(`Updated config ${name}, but could not save to file: ${err.message}.`)
							).catch(console.error.bind(console));
						}
					});
				} else {
					// Get config value.
					ephemeral(state, message.reply(`${name}: ${config[name as keyof typeof config]}`)).catch(
						console.error.bind(console)
					);
				}
			} else {
				ephemeral(state, message.reply("Unknown config.")).catch(console.error.bind(console));
			}
		} else {
			// List config entries.
			message
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
