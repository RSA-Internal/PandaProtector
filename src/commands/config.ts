import { writeFile } from "fs";
import { MessageEmbed, SlashCommand, SlashCommandChoice, SlashCommandOption } from "pandawrapper";
import { getState } from "../store/state";

const guildIdChoice: SlashCommandChoice = { name: "Guild Id", value: "guildId" };
const memberRoleId: SlashCommandChoice = { name: "Member Role Id", value: "memberRoleId" };
const staffRoleId: SlashCommandChoice = { name: "Staff Role Id", value: "staffRoleId" };
const showcaseChannelId: SlashCommandChoice = { name: "Showcase Channel Id", value: "showcaseChannelId" };
const reportChannelId: SlashCommandChoice = { name: "Report Channel Id", value: "reportChannelId" };
const botChannelId: SlashCommandChoice = { name: "Bot Channel Id", value: "botChannelId" };
const staffCategoryId: SlashCommandChoice = { name: "Staff Category Id", value: "staffCategoryId" };

export const configSlashCommand = new SlashCommand(
	"config",
	"Gets and updates config values, do not specify a name to list all config entries."
);

const configNameOption = new SlashCommandOption("name", "The config name (case-sensitive)", "STRING").setRequired();
configNameOption.setChoices([
	guildIdChoice,
	memberRoleId,
	staffRoleId,
	showcaseChannelId,
	reportChannelId,
	botChannelId,
	staffCategoryId,
]);

const configValueOption = new SlashCommandOption("value", "The new value for the config.", "STRING").setRequired();
configSlashCommand.addOption(configNameOption).addOption(configValueOption);
configSlashCommand.setCallback((interaction, args) => {
	const name = args[0].value as string | undefined;
	const value = args[1].value as string | undefined;
	const { config, configPath } = getState();

	if (name) {
		// Get or update config.
		if (name in config) {
			if (value) {
				// Update config value.
				config[name as keyof typeof config] = value as `${bigint}`;

				writeFile(configPath, JSON.stringify(config), err => {
					if (!err) {
						interaction
							.reply({
								content: `Updated config ${name}.`,
								ephemeral: true,
							})
							.catch(console.error.bind(console));
					} else {
						interaction
							.reply({
								content: `Updated config ${name}, but could not save to file: ${err.message}.`,
								ephemeral: true,
							})
							.catch(console.error.bind(console));
					}
				});
			} else {
				// Get config value.
				interaction
					.reply({ content: `${name}: ${config[name as keyof typeof config]}`, ephemeral: true })
					.catch(console.error.bind(console));
			}
		} else {
			interaction.reply({ content: "Unknown config.", ephemeral: true }).catch(console.error.bind(console));
		}
	} else {
		// List config entries.
		interaction
			.reply({
				embeds: [
					new MessageEmbed({
						title: "Config",
						fields: Object.entries(config).map(([name, value]) => ({
							name,
							value: value as string,
							inline: true,
						})),
					}),
				],
			})
			.catch(console.error.bind(console));
	}
});
