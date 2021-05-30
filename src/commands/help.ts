import { MessageEmbed } from "discord.js";
import { getCommand, getCommands } from ".";
import type { Command } from "../command";

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
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction, args) => {
		const commandName = args[0]?.value as string;
		if (!commandName) {
			// Display all commands.
			const commands = getCommands().filter(commandName => commandName.hasPermission(state, interaction));
			interaction
				.reply({
					embeds: [
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
						}),
					],
					ephemeral: command.shouldBeEphemeral(state, interaction),
				})
				.catch(console.error.bind(console));
		} else {
			// Display specific command information.
			const commandObject = getCommand(commandName);

			if (!commandObject || !commandObject.hasPermission(state, interaction)) {
				interaction
					.reply("The command does not exist.", { ephemeral: command.shouldBeEphemeral(state, interaction) })
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
					ephemeral: command.shouldBeEphemeral(state, interaction),
				})
				.catch(console.error.bind(console));
		}
	},
};

export default command;
