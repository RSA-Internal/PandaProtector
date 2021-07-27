import { ButtonInteraction, Guild, GuildMember, MessageActionRow, MessageButton, Snowflake } from "discord.js";
import { log } from "../logger";
import { answerModel, questionModel } from "../models/questionLog.model";

export async function handleAccept(interaction: ButtonInteraction, guild: Guild, member: GuildMember): Promise<void> {
	const message = interaction.message;
	const embed = message.embeds[0];

	if (embed) {
		const answerID = parseInt(embed.footer?.text?.slice(4) ?? "-1");

		if (answerID === -1) {
			interaction.reply({
				content: "Failed to parse answer id.",
				ephemeral: true,
			});
		}

		await answerModel
			.findOne({ answerID: answerID })
			.then(async answer => {
				if (answer) {
					const questionId = answer.attachedID;

					await questionModel.findOne({ questionID: questionId }).then(question => {
						if (question) {
							const authorID = question.authorID;

							if (member.id === authorID && question.acceptedAnswer === 0) {
								interaction
									.reply({
										content: `Accepting answer #${answerID}`,
										ephemeral: true,
									})
									.then(async () => {
										questionModel
											.updateOne({ questionID: questionId }, { acceptedAnswer: answerID })
											.catch(err => log(err, "warn"));
										const answerMessage = await interaction.channel?.messages.fetch(
											answer.discordMessageID as Snowflake
										);

										if (answerMessage) {
											const answerEmbed = answerMessage.embeds[0];
											answerEmbed.setTitle(
												`${answerEmbed.title} <:author_accepted:869447434089160710>`
											);

											answerMessage.edit({
												embeds: [answerEmbed],
												components: [
													new MessageActionRow().addComponents(
														new MessageButton()
															.setCustomId("upvote")
															.setLabel("Upvote")
															.setStyle("PRIMARY"),
														new MessageButton()
															.setCustomId("downvote")
															.setLabel("Downvote")
															.setStyle("DANGER")
													),
												],
											});
										}

										await answerModel.find({ attachedID: questionId }, (err, answers) => {
											answers.forEach(async answer2 => {
												const message = await interaction.channel?.messages.fetch(
													answer2.discordMessageID as Snowflake
												);

												if (message) {
													message.edit({
														embeds: message.embeds,
														components: [
															new MessageActionRow().addComponents(
																new MessageButton()
																	.setCustomId("upvote")
																	.setLabel("Upvote")
																	.setStyle("PRIMARY"),
																new MessageButton()
																	.setCustomId("downvote")
																	.setLabel("Downvote")
																	.setStyle("DANGER")
															),
														],
													});
												}
											});
										});
									})
									.catch(err => log(err, "warn"));
							} else {
								if (question.acceptedAnswer !== 0) {
									interaction
										.reply({
											content: `You have already accepted an answer for this question.`,
											ephemeral: true,
										})
										.catch(err => log(err, "warn"));
								} else {
									interaction
										.reply({
											content: `You can't accept this answer.`,
											ephemeral: true,
										})
										.catch(err => log(err, "warn"));
								}
							}
						}
					});
				}
			})
			.catch(err => log(err, "warn"));
	} else {
		interaction.reply({
			content: "No embed found.",
			ephemeral: true,
		});
	}
}
