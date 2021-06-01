import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { writeFile } from "fs";
import type { Command } from "../command";
import { log, logLevels, updateVerbosity } from "../logger";

const command: Command = {
	name: "config",
	description: "Gets and updates config values, do not specify a name to list all config entries.",
	options: [
		{
			type: "STRING",
			name: "name",
			description: "The config name (case-sensitive).",
			choices: [
				{
					name: "Guild Id",
					value: "guildId",
				},
				{
					name: "Member Role Id",
					value: "memberRoleId",
				},
				{
					name: "Staff Role Id",
					value: "staffRoleId",
				},
				{
					name: "Developer Role Id",
					value: "developerRoleId",
				},
				{
					name: "Showcase Channel Id",
					value: "showcaseChannelId",
				},
				{
					name: "Report Channel Id",
					value: "reportChannelId",
				},
				{
					name: "Bot Channel Id",
					value: "botChannelId",
				},
				{
					name: "Staff Category Id",
					value: "staffCategoryId",
				},
				{
					name: "Github Repository Path",
					value: "ghRepoPath",
				},
				{
					name: "Debug Mode",
					value: "debugMode",
				},
				{
					name: "Debug Channel Id",
					value: "debugChannelId",
				},
			],
		},
		{
			type: "STRING",
			name: "value",
			description: "The new value for the config.",
		},
	],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.developerRoleId),
	shouldBeEphemeral: (state, interaction) =>
		(interaction.channel as TextChannel).parent?.id !== state.config.staffCategoryId,
	handler: (state, interaction, args) => {
		const name = args[0]?.value as string | undefined;
		const value = args[1]?.value as string | undefined;
		const { config } = state;

		if (name) {
			// Get or update config.
			if (name in config) {
				if (value) {
					if (name === "debugMode") {
						if (!updateVerbosity(value)) {
							interaction
								.reply(`Could not update debugMode in config due to an unsupported verbosity level.`)
								.catch(err => log(err, logLevels.error));
							return false;
						}
					}
					// Update config value.
					config[name as keyof typeof config] = value as `${bigint}`;

					writeFile(state.configPath, JSON.stringify(config), err => {
						if (!err) {
							interaction
								.reply(`Updated config ${name}.`, {
									ephemeral: command.shouldBeEphemeral(state, interaction),
								})
								.catch(err => log(err, logLevels.error));
						} else {
							log(err.message, logLevels.error);

							interaction
								.reply(`Updated config ${name}, but could not save to file: ${err.message}.`, {
									ephemeral: command.shouldBeEphemeral(state, interaction),
								})
								.catch(err => log(err, logLevels.error));
						}
					});
				} else {
					// Get config value.
					interaction
						.reply(`${name}: ${config[name as keyof typeof config]}`, { ephemeral: true })
						.catch(err => log(err, logLevels.error));
				}
			} else {
				interaction
					.reply("Unknown config.", { ephemeral: command.shouldBeEphemeral(state, interaction) })
					.catch(err => log(err, logLevels.error));
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
				.catch(err => log(err, logLevels.error));
		}
	},
};

export default command;
