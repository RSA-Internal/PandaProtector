import type { Snowflake } from "discord-api-types";
import type { CommandInteractionOption } from "discord.js";
import { mkdir, stat, unlink, writeFile } from "fs";
import { log } from "../logger";
import moderatedMessageLogModel from "../models/moderatedMessageLog.model";
import moderationActionLogModel from "../models/moderationActionLog.model";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "history",
	description: "Review moderation history of a user.",
	options: [
		{
			type: "SUB_COMMAND",
			name: "view",
			description: "View history of a specified user.",
			options: [
				{
					type: "USER",
					name: "user",
					description: "User to see the record of.",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "remove",
			description: "Remove a record from the user's history.",
			options: [
				{
					type: "INTEGER",
					name: "case",
					description: "The case number you want removed from the system.",
					required: true,
				},
			],
		},
	],
	shouldBeEphemeral: () => true,
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) });
		const subCommandArgument = args.first() as CommandInteractionOption;
		const caseTypeCss = { 0: "note", 20: "warn", 30: "mute", 40: "kick", 50: "tban", 60: "pban" };
		const caseTypeName = {
			0: "Note",
			20: "Warning",
			30: "Mute",
			40: "Kick",
			50: "Temporary Ban",
			60: "Permanent Ban",
		};
		if (subCommandArgument.name === "view" && subCommandArgument.options) {
			const historicalUser = getState().client.users.cache.get(
				subCommandArgument.options.get("user")?.value as Snowflake
			);
			//Check if historicalUser even exists, it should, and one of two things...
			// If the historical user is also the person running the interaction.
			// If the person running the interaction is a staff member.
			if (
				historicalUser &&
				(historicalUser.id !== interaction.user.id ||
					interaction.guild?.members
						.resolve(interaction.user.id)
						?.roles.cache.get(getState().config.staffRoleId))
			) {
				moderationActionLogModel
					.find({ offenderId: historicalUser.id, publicRemoved: false }, (err, docs) => {
						if (err) {
							log(err.message, "error");
						}

						const username = `${historicalUser.username} [${historicalUser.id}]`;

						let htmlString = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>@import url('https://fonts.googleapis.com/css2?family=Rubik&display=swap');*{font-family: 'Rubik', sans-serif;}body{background-color: #fffdee;}h1{text-align: center;}.wrapper{display: grid;grid-template-columns: repeat(5,auto);gap: 10px;grid-auto-rows: minmax(100px, auto);}@media screen and (max-width: 1920px){.wrapper{grid-template-columns: repeat(3,auto);}}@media screen and (max-width: 1250px){.wrapper{grid-template-columns: repeat(2,auto);}}@media screen and (max-width: 900px){.wrapper{grid-template-columns: repeat(1,auto);}}.card{border-width: 1px 1px 1px 3px;border-radius: 3px;border-style: solid;padding: 5px 10px;}.pban{border-color: #BBB #BBB #BBB #000000;background-color: #C0C0C0;}.tban{border-color: #BBB #BBB #BBB #FF0000;background-color: #E9C9C9;}.kick{border-color: #BBB #BBB #BBB #FF6A00;background-color: #F1DED1;}.mute{border-color: #BBB #BBB #BBB #FFD800;background-color: #F9F3D9;}.warn{border-color: #BBB #BBB #BBB #0094FF;background-color: #CEE1EE;}.note{border-color: #BBB #BBB #BBB #C0C0C0;background-color: #FFFFFF;}</style><title>Moderation Record</title></head><body><h1>Moderation Records for ${username}</h1><div class="wrapper">`;
						docs.forEach(item => {
							const translatedCaseTypeCss = caseTypeCss[item.actionLevel];
							const translatedaseTypeName = caseTypeName[item.actionLevel];
							const moderator = getState().client.users.cache.get(item.moderatorId as Snowflake);
							const timeStamp = item.createdAt.toUTCString();
							const actionNote = item.note;
							const actionReason = item.reason;
							const affiliatedMessageId = item.messageId;
							htmlString += `<div class="card ${translatedCaseTypeCss}"><h3>${translatedaseTypeName}</h3><p><b>Moderator</b>: ${
								moderator ? moderator.username : "unknown"
							} - ${item.moderatorId}</p><p><b>Timestamp</b>: ${timeStamp}</p>`;
							if (actionNote) {
								htmlString += `<p><b>Note</b>: ${actionNote}</p>`;
							}
							htmlString += `<p><b>Reason</b>: ${actionReason}</p>`;
							if (affiliatedMessageId) {
								moderatedMessageLogModel
									.find({ messageId: affiliatedMessageId }, (err, msgs) => {
										if (err) {
											log(err.message, "error");
											htmlString += `<p>Failed to load Message ID ${affiliatedMessageId}.</p>`;
										} else if (msgs.length === 0) {
											htmlString += `<p>Failed to load Message ID ${affiliatedMessageId}.</p>`;
										} else {
											htmlString += `<p><b>Affiliated Message</b>: ${msgs[0].messageContent}</p>`;
										}
									})
									.catch(err => {
										log(err, "error");
										htmlString += `<p>Failed to load Message ID ${affiliatedMessageId}.</p>`;
									});
							}
							htmlString += `<p><small>Case Number: ${item.caseNumber}</small></p></div>`;
						});
						htmlString += `</div></body></html>`;

						const fileName = Math.floor(Math.random() * 9999999).toString() + ".html";
						stat("./temporaryFiles", (err, stat) => {
							if (err) {
								log(err.message, "error");
							}
							if (!stat.isDirectory()) {
								mkdir("./temporaryFiles", err => {
									if (err) {
										log(err.message, "error");
										return;
									}
								});
							}
							writeFile(`./temporaryFiles/${fileName}`, htmlString, err => {
								if (err) {
									console.log(err);
									interaction
										.editReply("Error creating the document.")
										.catch(subErr => log(subErr, "error"));
									return;
								} else {
									interaction.user
										.createDM()
										.then(dms => {
											dms.send({
												files: [
													{
														attachment: `./temporaryFiles/${fileName}`,
													},
												],
											}).catch(err => {
												log(err, "error");
												interaction
													.editReply("The document couldn't be DM'ed to the requester.")
													.catch(subErr => log(subErr, "error"));
											});
										})
										.catch(err => {
											log(err, "error");
											interaction
												.editReply("The document couldn't be DM'ed to the requester.")
												.catch(subErr => log(subErr, "error"));
										});
								}
							});
						});
						interaction
							.editReply("Records have been sent to your DMs.")
							.catch(subErr => log(subErr, "error"));
						setTimeout(function () {
							unlink(`./temporaryFiles/${fileName}`, err => {
								if (err) log(err?.message, "error");
							});
						}, 10000);
						//console.log("Hi!");
					})
					.catch(err => {
						log(err, "error");
						interaction.editReply("Couldn't query database.").catch(subErr => log(subErr, "error"));
					});
			}
			//interaction.editReply("Command in testing phase.");
		} else if (subCommandArgument.name === "remove" && subCommandArgument.options) {
			const caseId = subCommandArgument.options.get("case")?.value;
			console.log(caseId);
		} else {
			interaction.editReply("Failed, subcommand not recognized.").catch(err => log(err, "error"));
		}
	},
};

export default command;
