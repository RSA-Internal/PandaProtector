import type { Interaction } from "discord.js";
import { getCommand } from "../commands";
import { captchaCache } from "../commands/verify";
import { log } from "../logger";
import commandLogModel from "../models/commandLog.model";
import { getState } from "../store/state";
import type { Event } from "../types/event";

const event: Event = {
	name: "interactionCreate",
	execute: async (...args) => {
		const interaction = [...args][0] as unknown as Interaction;
		log(`Firing event: ${event.name}`, "debug");
		if (interaction) {
			if (interaction.isCommand()) {
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
			} else if (interaction.isSelectMenu()) {
				const name = interaction.customID;
				const values = interaction.values;
				const user = interaction.user;
				const guild = interaction.guild;
				const member = guild?.members.resolve(user.id);

				if (name === "captchaSelector") {
					const captcha = captchaCache.get(user.id) as string;
					const selectedCaptcha = (values as string[])[0];

					if (captcha === selectedCaptcha) {
						interaction.update({
							components: [],
							embeds: [],
							content: "You have selected the correct captcha.",
						});

						if (member) {
							member.roles.add(getState().config.memberRoleId).catch(console.warn.bind(console));
						}
					} else {
						interaction.update({
							components: [],
							embeds: [],
							content: "You have selected an invalid captcha.",
						});

						if (member) {
							//member.kick("Invalid captcha.");
						}
					}
				}
			} else if (interaction.isButton()) {
				console.log(interaction);
			}
		}
	},
};

export default event;
