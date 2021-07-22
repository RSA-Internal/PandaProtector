import { Interaction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { getCommand } from "../commands";
import { captchaCache } from "../commands/verify";
import { log } from "../logger";
import commandLogModel from "../models/commandLog.model";
import { getState } from "../store/state";
import type { Event } from "../types/event";
import { embedCache } from "./guildMemberAdd";

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
						interaction
							.update({
								components: [],
								embeds: [],
								content: "You have selected the correct captcha.",
							})
							.then(() => {
								const messageId = embedCache.get(user.id);
								const logChannel = guild?.channels.cache.get(
									getState().config.joinLogChannelId as `${bigint}`
								) as TextChannel;

								if (logChannel && messageId) {
									logChannel.messages
										.fetch(messageId)
										.then(message => {
											message
												.edit({
													embeds: message.embeds,
													components: [],
												})
												.then(() => {
													embedCache.delete(user.id);
												})
												.catch(err => log(err, "error"));
										})
										.catch(err => log(err, "error"));
								}
							})
							.catch(err => log(err, "error"));

						if (member) {
							member.roles.add(getState().config.memberRoleId).catch(console.warn.bind(console));
						}
					} else {
						interaction
							.update({
								components: [],
								embeds: [],
								content: "You have selected an invalid captcha.",
							})
							.catch(err => log(err, "error"));

						if (member) {
							//member.kick("Invalid captcha.");
						}
					}
				}
			} else if (interaction.isButton()) {
				const name = interaction.customID;
				const guild = interaction.guild;
				const components = interaction.message.components;

				if (guild) {
					const member = guild.members.cache.get(interaction.user.id);

					if (member && member.roles.cache.has(getState().config.staffRoleId)) {
						if (components) {
							const idToInteract = (components[0].components as MessageButton[]).filter(
								button => button.customID === "memberId"
							)[0].label as `${bigint}`;

							if (idToInteract) {
								const memberToInteract = guild.members.cache.get(idToInteract);

								if (memberToInteract) {
									if (name === "ban") {
										memberToInteract
											.ban({
												reason: `Banned by ${member.displayName}[${member.id}] via join embed.`,
											})
											.then(() => {
												interaction
													.update({
														embeds: interaction.message.embeds as MessageEmbed[],
														components: [
															new MessageActionRow().addComponents(
																new MessageButton()
																	.setCustomID("banned")
																	.setStyle("SECONDARY")
																	.setLabel(
																		`Banned by ${member.displayName}[${member.id}]`
																	)
																	.setDisabled(true)
															),
														],
													})
													.catch(err => log(err, "error"));
											})
											.catch(err => log(err, "error"));
									} else if (name === "kick") {
										memberToInteract
											.kick(`Kicked by ${member.displayName}[${member.id}] via join embed.`)
											.then(() => {
												interaction
													.update({
														embeds: interaction.message.embeds as MessageEmbed[],
														components: [
															new MessageActionRow().addComponents(
																new MessageButton()
																	.setCustomID("kicked")
																	.setStyle("SECONDARY")
																	.setLabel(
																		`Kicked by ${member.displayName}[${member.id}]`
																	)
																	.setDisabled(true)
															),
														],
													})
													.catch(err => log(err, "error"));
											})
											.catch(err => log(err, "error"));
									}
								}
							}
						}
					}
				}
			}
		}
	},
};

export default event;
