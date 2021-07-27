import type { Interaction, MessageActionRow } from "discord.js";
import { handleAccept } from "../buttons/acceptButton";
import { handleJoinButtons } from "../buttons/joinEmbedButtons";
import { handleRegenCaptcha } from "../buttons/regenCaptcha";
import { getCommand } from "../commands";
import { log } from "../logger";
import { handleCaptchaSelector } from "../menus/captchaSelector";
import commandLogModel from "../models/commandLog.model";
import type { Event } from "../types/event";

const event: Event = {
	name: "interactionCreate",
	execute: (...args) => {
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
							arguments: interaction.options.data.map(value => String(value.value)),
						})
						.catch(console.error.bind(console));

					command.handler(interaction, interaction.options);
				}
			} else if (interaction.isSelectMenu()) {
				const name = interaction.customId;
				const values = interaction.values;
				const user = interaction.user;
				const guild = interaction.guild;
				const member = guild?.members.resolve(user.id);

				if (!values || !guild || !member) {
					interaction
						.update({
							components: [],
							embeds: [],
							content:
								"Failed to handle interaction, please try again later. If the problem persists contact guild owner.",
						})
						.catch(err => log(err, "error"));
					return;
				}

				if (name === "captchaSelector") {
					handleCaptchaSelector(interaction, values, guild, user, member);
				}
			} else if (interaction.isButton()) {
				const name = interaction.customId;
				const guild = interaction.guild;
				const components = interaction.message.components;

				if (guild) {
					const member = guild.members.cache.get(interaction.user.id);

					if (member) {
						if (name === "ban" || name === "kick") {
							if (!components) {
								interaction
									.update({
										components: [],
										embeds: [],
										content:
											"Failed to handle interaction, please try again later. If the problem persists contact guild owner.",
									})
									.catch(err => log(err, "error"));
								return;
							}
							handleJoinButtons(interaction, components as MessageActionRow[], guild, member, name);
						} else if (name === "regenCaptcha") {
							handleRegenCaptcha(interaction, member);
						} else if (name === "accept") {
							handleAccept(interaction, guild, member);
						}
					}
				}
			}
		}
	},
};

export default event;
