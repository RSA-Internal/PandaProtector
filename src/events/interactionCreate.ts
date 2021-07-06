import type { Interaction } from "discord.js";
import { getCommand } from "../commands";
import { log } from "../logger";
import commandLogModel from "../models/commandLog.model";
import type { Event } from "../types/event";

const event: Event = {
	name: "interactionCreate",
	execute: (...args) => {
		const interaction = [...args][0] as unknown as Interaction;
		log(`Firing event: ${event.name}`, "debug");
		if (interaction) {
			if (!interaction.isCommand()) return;
			const command = getCommand(interaction.commandName);
			if (command) {
				commandLogModel
					.create({
						discordId: interaction.user.id,
						command: command.name,
						arguments: interaction.options.map(value => String(value.value)),
					})
					.catch(console.error.bind(console));

				command.handler(interaction, interaction.options);
			}
		}
	},
};

export default event;
