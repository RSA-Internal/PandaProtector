import { MessageEmbed } from "discord.js";
import { getCommand, getCommands } from ".";
import type { Command } from "../command";

/**
 *   interface ApplicationCommandOptionData {
    type: ApplicationCommandOptionType | ApplicationCommandOptionTypes;
    name: string;
    description: string;
    required?: boolean;
    choices?: ApplicationCommandOptionChoice[];
    options?: ApplicationCommandOption[];
  }
 */

const command: Command = {
	name: "help",
	description: "Gets command help.",
	options: [
		{
			type: "STRING",
			name: "command",
			description: "The command name to get help with.",
			required: false,
		},
	],
	hasPermission: () => true,
	parseArguments: content => [content],
	handler: (state, interaction, args) => {
		const command = args[0].value as string;
		if (!command) {
			// Display all commands.
			const commands = getCommands().filter(command => command.hasPermission(state, interaction));
			interaction
				.reply(
					new MessageEmbed({
						fields: [
							{
								name: "Commands",
								value:
									`${commands
										.map(command => `*${command.name}* - ${command.description}`)
										.join("\n")}` || "None",
							},
						],
					})
				)
				.catch(console.error.bind(console));
		} else {
			// Display specific command information.
			const commandObject = getCommand(command);

			if (!commandObject || !commandObject.hasPermission(state, interaction)) {
				//ephemeral(state, interaction.reply("The command does not exist.")).catch(console.error.bind(console));
				interaction.reply("The command does not exist.").catch(console.error.bind(console));
				return;
			}

			interaction
				.reply(
					new MessageEmbed({
						fields: [
							{
								name: "Command",
								value: `${commandObject.name} ${commandObject.options
									.map(option => (option.required ? `*[${option.name}]*` : `*${option.name}*`))
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
					})
				)
				.catch(console.error.bind(console));
		}
	},
};

export default command;
