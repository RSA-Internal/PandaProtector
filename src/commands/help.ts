import { MessageEmbed } from "discord.js";
import { getCommand, getCommands } from ".";
import type { Command } from "../command";
import { ephemeral } from "../ephemeral";

const command: Command = {
	name: "help",
	description: "Gets command help.",
	options: [
		{
			name: "command",
			description: "The command name to get help with.",
			optional: true,
		},
	],
	hasPermission: () => true,
	parseArguments: content => [content],
	handler: (state, message, command) => {
		if (!command) {
			// Display all commands.
			const commands = getCommands().filter(command => command.hasPermission(state, message));
			message
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
				.catch(reason => console.error(reason));
		} else {
			// Display specific command information.
			const commandObject = getCommand(command);

			if (!commandObject || !commandObject.hasPermission(state, message)) {
				ephemeral(state, message.reply("The command does not exist.")).catch(reason => console.error(reason));
				return;
			}

			message
				.reply(
					new MessageEmbed({
						fields: [
							{
								name: "Command",
								value: `${commandObject.name} ${commandObject.options
									.map(option => (option.optional ? `*[${option.name}]*` : `*${option.name}*`))
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
				.catch(reason => console.error(reason));
		}
	},
};

export default command;
