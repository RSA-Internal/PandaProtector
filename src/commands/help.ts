import { MessageEmbed } from "discord.js";
import { getCommand } from ".";
import type { Command } from "../command";
import { log } from "../logger";
import { getState } from "../store/state";
import { getMemberCommands } from "../util";

const command: Command = {
	name: "help",
	description: "Gets command help.",
	options: [
		{
			type: "STRING",
			name: "command",
			description: "The command name to get help with.",
		},
	],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: (interaction, args) => {
		const commandName = args.get("command")?.value as string;
		const memberCommands = getMemberCommands(interaction.member);

		if (!commandName) {
			// Display all commands
			interaction
				.reply({
					embeds: [
						new MessageEmbed({
							fields: [
								{
									name: "Commands",
									value:
										`${memberCommands
											.map(command => `*${command.name}* - ${command.description}`)
											.join("\n")}` || "None",
								},
							],
						}),
					],
					ephemeral: command.shouldBeEphemeral(interaction),
				})
				.catch(err => log(err as string, "error"));
		} else {
			//Display specific command information.
			const commandObject = getCommand(commandName);

			if (!commandObject) {
				interaction
					.reply("The command does not exist.", { ephemeral: command.shouldBeEphemeral(interaction) })
					.catch(console.error.bind(console));
				return;
			}

			if (!memberCommands.includes(commandObject)) {
				interaction
					.reply("You do not have access to this command.", {
						ephemeral: command.shouldBeEphemeral(interaction),
					})
					.catch(console.error.bind(console));
				return;
			}

			interaction
				.reply({
					embeds: [
						new MessageEmbed({
							fields: [
								{
									name: "Command",
									value: `${commandObject.name} ${commandObject.options
										.map(option => (option.required ? `*${option.name}*` : `*[${option.name}]*`))
										.join(" ")}`,
								},
								{
									name: "Description",
									value: commandObject.description,
								},
								{
									name: "Arguments",
									value:
										`${commandObject.options
											.map(option => `*${option.name}* - ${option.description}`)
											.join("\n")}` || "None",
								},
							],
						}),
					],
					ephemeral: command.shouldBeEphemeral(interaction),
				})
				.catch(console.error.bind(console));
		}
	},
};

export default command;
