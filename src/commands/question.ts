import { Message, MessageEmbed, Snowflake, TextChannel, ThreadChannel, ThreadChannelResolvable } from "discord.js";
import { log } from "../logger";
import { answerModel, commentModel, questionModel } from "../models/questionLog.model";
import { getState } from "../store/state";
import type { Command } from "../types/command";
import { getDisplayName } from "../util";

const command: Command = {
	name: "question",
	description: "Interact with the question and answer system",
	options: [
		{
			name: "ask",
			type: "SUB_COMMAND",
			description: "Ask a question.",
			options: [
				{
					name: "title",
					description: "This is the basic question you are asking.",
					type: "STRING",
					required: true,
				},
				{
					name: "body",
					description: "This is the full extent of your question. Steps you have taken, code, etc.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "answer",
			type: "SUB_COMMAND",
			description: "Answer an open and unanswered question.",
			options: [
				{
					name: "questionid",
					description: "The questionID of the question you want to answer.",
					type: "INTEGER",
					required: true,
				},
				{
					name: "answer",
					description: "Your answer to the question.",
					type: "STRING",
					required: true,
				},
			],
		},
		{
			name: "lookup",
			type: "SUB_COMMAND_GROUP",
			description: "Query for a question",
			options: [
				{
					name: "title",
					description: "Lookup a question by title.",
					type: "SUB_COMMAND",
					options: [
						{
							name: "query",
							description: "Title to look for.",
							type: "STRING",
							required: true,
						},
					],
				},
				{
					name: "questionid",
					description: "Lookup a question by questionID.",
					type: "SUB_COMMAND",
					options: [
						{
							name: "query",
							description: "Question ID to look for.",
							type: "INTEGER",
							required: true,
						},
					],
				},
				{
					name: "user",
					description: "Lookup a question by user.",
					type: "SUB_COMMAND",
					options: [
						{
							name: "query",
							description: "User to look for.",
							type: "USER",
							required: true,
						},
					],
				},
			],
		},
		{
			name: "comment",
			type: "SUB_COMMAND",
			description: "Leave a comment on an answer or question.",
			options: [
				{
					name: "type",
					description: "Are we commenting on a question or an answer?",
					type: "STRING",
					required: true,
					choices: [
						{
							name: "Question",
							value: "question",
						},
						{
							name: "Answer",
							value: "answer",
						},
					],
				},
				{
					name: "objectid",
					description: "The question or answer id.",
					type: "INTEGER",
					required: true,
				},
				{
					name: "comment",
					description: "The comment to leave.",
					type: "STRING",
					required: true,
				},
			],
		},
	],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: true });
		const guild = interaction.guild;
		const interactionMember = interaction.member;
		const qaChannelId = getState().config.qaChannelId;

		if (guild && interactionMember) {
			const guildMember = guild.members.cache.get(interactionMember.user.id);

			if (guildMember) {
				const subCommandData = args["_hoistedOptions"];

				if (subCommandData) {
					const subCommand = args["_subCommand"];
					const subArgs = new Map<string, string | number | boolean | undefined>();

					subCommandData.forEach(option => subArgs.set(option.name, option.value));

					if (subArgs) {
						if (subCommand === "ask") {
							const title = String(subArgs.get("title"));
							const body = String(subArgs.get("body"));

							if (!title || !body) {
								return interaction
									.editReply("Error in posting question. [3]")
									.catch(err => log(err, "error"));
							}

							// look up (fuzzy search) before generating question
							// if a question was found return that result instead of posting question

							questionModel.countDocuments({}, (err, count) => {
								if (err) {
									return interaction
										.editReply("Error in posting question. [1]")
										.catch(err => log(err, "error"));
								}

								questionModel
									.create({
										questionID: count + 1,
										authorID: guildMember.id as string,
										title: title,
										body: body,
									})
									.then(() => {
										// create thread
										const qaChannel = guild.channels.cache.get(qaChannelId) as TextChannel;

										if (qaChannel) {
											qaChannel.threads
												.create({
													name: title,
													autoArchiveDuration: 1440,
													reason: `Command issues question by ${guildMember.displayName}`,
												})
												.then(threadChannel => {
													threadChannel
														.send({
															embeds: [
																new MessageEmbed()
																	.setAuthor(`${title}`)
																	.setTitle(`${guildMember.displayName} [0]`)
																	.setDescription(body)
																	.setFooter(`ID: ${count + 1}`),
															],
														})
														.then(message => {
															message.pin().catch(err => log(err, "warn"));
															questionModel
																.updateOne(
																	{ questionID: count + 1 },
																	{
																		discordMessageID: message.id,
																		threadID: threadChannel.id,
																	}
																)
																.catch(err => log(err, "error"));
															threadChannel.members
																.add(guildMember, "Author of thread question.")
																.catch(err => log(err, "warn"));
														})
														.catch(err => log(err, "warn"));
												})
												.catch(err => log(err, "error"));
										}

										return interaction.editReply({
											content: `\`${title}\` has been posted successfully.\nID: #${count + 1}`,
										});
									})
									.catch(err => {
										log(err, "error");
										return interaction
											.editReply("Error in posting question. [2]")
											.catch(err => log(err, "error"));
									});
							});
						} else if (subCommand === "comment") {
							const type = String(subArgs.get("type"));
							const objectID = subArgs.get("objectid") as number;
							const comment = String(subArgs.get("comment"));

							commentModel.countDocuments({}, (err, count) => {
								if (err) {
									return interaction
										.editReply("Error in posting comment. [1]")
										.catch(err => log(err, "error"));
								}

								commentModel
									.create({
										commentID: count + 1,
										authorID: guildMember.id as string,
										content: comment,
										attachedID: String(objectID),
										type: type,
									})
									.then(async newComment => {
										console.log(`Looking for ${objectID}`);
										let threadChannelId: string | undefined;
										let discordMessageId: string | undefined;

										if (type === "answer") {
											await answerModel.findOne({ answerID: objectID }).then(answer => {
												if (answer) {
													discordMessageId = answer.discordMessageID;
													threadChannelId = answer.threadID;
												} else {
													console.log("No answer found.");
												}
											});
										} else if (type === "question") {
											await questionModel.findOne({ questionID: objectID }).then(question => {
												if (question) {
													discordMessageId = question.discordMessageID;
													threadChannelId = question.threadID;
												} else {
													console.log("No question found.");
												}
											});
										}

										if (!discordMessageId) {
											return interaction.editReply("Failed to fetch discord message id");
										}

										if (!threadChannelId) {
											return interaction.editReply("Failed to fetch thread id");
										}

										const parentChannel = guild.channels.cache.get(
											qaChannelId as Snowflake
										) as TextChannel;

										const threadChannel = (await parentChannel.threads.fetch(
											threadChannelId as ThreadChannelResolvable
										)) as ThreadChannel;

										const messages = threadChannel.messages;
										let message: Message | undefined;

										if (messages) {
											message = await messages.fetch(discordMessageId as Snowflake);
										}

										if (message) {
											const embed = message.embeds[0];

											if (embed) {
												let field = embed.fields[0];
												if (!field) {
													field = {
														name: "Comments",
														value: "List of comments",
														inline: true,
													};
												}

												const commentList: string[] = [];

												await commentModel.find(
													{ attachedID: objectID, type: type },
													(err, comments) => {
														comments.forEach(comment => {
															commentList.push(
																`${comment.content}\n-${getDisplayName(
																	guild,
																	comment.authorID
																)} [0]`
															);
														});
													}
												);

												if (commentList.length === 0) {
													commentList.push(
														`${newComment.content}\n-${getDisplayName(
															guild,
															newComment.authorID
														)} [0]`
													);
												}

												console.log(commentList);

												field.value = commentList.join("\n\n");

												const newEmbed = new MessageEmbed()
													.setTitle(embed.title ?? "")
													.setAuthor(embed.author?.name ?? "")
													.setDescription(embed.description ?? "")
													.addFields(field)
													.setFooter(embed.footer?.text ?? "");

												message
													.edit({ embeds: [newEmbed] })
													.then(() => interaction.editReply("Comment posted successfully!"))
													.catch(err => log(err, "error"));
											}
										} else {
											return interaction
												.editReply("Error in posting comment. [4]")
												.catch(err => log(err, "error"));
										}

										if (!discordMessageId) {
											return interaction
												.editReply("Error in posting comment. [3]")
												.catch(err => log(err, "error"));
										}
									})
									.catch(err => {
										log(err, "error");
										return interaction
											.editReply("Error in posting comment. [2]")
											.catch(err => log(err, "error"));
									});
							});
						} else if (subCommand === "answer") {
							const questionId = subArgs.get("questionid") as number;
							const answer = String(subArgs.get("answer"));

							answerModel.countDocuments({}, (err, count) => {
								if (err) {
									return interaction
										.editReply("Error in posting answer. [1]")
										.catch(err => log(err, "error"));
								}

								answerModel
									.create({
										answerID: count + 1,
										authorID: guildMember.id as string,
										content: answer,
										attachedID: questionId,
									})
									.then(async () => {
										const threadChannelId = (
											await questionModel.findOne({ questionID: questionId })
										)?.threadID;

										if (!threadChannelId) {
											return interaction.editReply({
												content: "Failed to fetch thread channel id.",
											});
										}

										const parentChannel = guild.channels.cache.get(
											qaChannelId as Snowflake
										) as TextChannel;

										const threadChannel = (await parentChannel.threads.fetch(
											threadChannelId as ThreadChannelResolvable
										)) as ThreadChannel;

										threadChannel
											.send({
												embeds: [
													new MessageEmbed()
														.setTitle(getDisplayName(guild, guildMember.id))
														.setDescription(answer)
														.setFooter(`ID: ${count + 1}`),
												],
											})
											.then(message => {
												answerModel
													.updateOne(
														{ answerID: count + 1 },
														{
															discordMessageID: message.id,
															threadID: threadChannelId,
														}
													)
													.catch(err => log(err, "error"));
											});

										return interaction.editReply({
											content: `Your answer has been posted successfully.\nID: #${count + 1}`,
										});
									})
									.catch(err => {
										log(err, "error");
										return interaction
											.editReply("Error in posting answer. [2]")
											.catch(err => log(err, "error"));
									});
							});
						} else {
							return interaction.editReply("WIP").catch(err => log(err, "error"));
						}
					} else {
						return interaction
							.editReply("There were no arguments provided.")
							.catch(err => log(err, "error"));
					}
				} else {
					return interaction
						.editReply("Failed to retrieve interaction data.")
						.catch(err => log(err, "error"));
				}
			}

			/**
			 * Get passed options
			 * Handle appropriate routes
			 *
			 *
			 	* asking questions
					* look up (fuzzy search) before generating question
						* if a question was found return that result instead of posting question
					* generate question
						* post to mongoose
						* if threads are enabled (probably not for a while) create a thread
							* if possible set notification of thread to only mentions
			*
			*
				* answering questions
					* mongoose findAndUpdate based on questionID
					* provide memberID and content
					* check if author of question has opt'd into receiving notifications
						* if yes, DM that an answer has been posted to their question

			*
			*
				* accepting answers
					* prompt user with simple question embed: Are you sure you want to accept this answer.
					* upon accepting update mongoose with author accepted answer
					* if threads are enabled - archive the thread
					* if answer author is opt'd into receiving notifications - DM them stating their answer was accepted
					* once question is answered
						* prevent future answers from being posted
						* prevent author changing answers
					* once a community answer has been determined
						* prevent all upvote/downvote interactions

			*
			*
				* upvoting / downvoting answers
					* can only do one irreversible action per answer
					* once an answer receives 5 upvotes it is marked as a community accepted answer
						* given there is not already one
						* the author will also receive +1 Rep
					* once an answer receives 5 downvotes, the author receives -1 Rep
						* To downvote, users will need to have atleast 10 rep
						* Upon downvote, the downvoting user will receive -1 Rep.
							* This is to deter use of downvote as a means of removing trolls and use the report feature

			*
			*
				* looking up questions
					* Can return result of up-to 5 questions
					* will display in order of most recent
			 */
		}
	},
};

export default command;
