import type { Snowflake } from "discord-api-types";
import { MessageEmbed, TextChannel } from "discord.js";
import { shortMappings } from "../../short-reasons-mapping.json";
import { modOptions } from "../../short-reasons.json";
import { log } from "../logger";
import moderatedMessageLogModel from "../models/moderatedMessageLog.model";
import { getState } from "../store/state";
import type { Command } from "../types/command";
import { addModerationRecordToDB, addModerationRecordWithMessageToDB, getMessageFromId } from "../util";

const command: Command = {
	name: "warn",
	description: "Give user a warning.",
	options: [
		{
			type: "USER",
			name: "offender",
			description: "User who broke the rules.",
			required: true,
		},
		{
			type: "STRING",
			name: "short",
			description: "Shorthand reason for action.",
			required: true,
			choices: shortMappings,
		},
		{
			type: "STRING",
			name: "reason",
			description: "Longhand reason for action.",
		},
		{
			type: "STRING",
			name: "message",
			description: "Message ID of the offending message.",
		},
	],
	shouldBeEphemeral: interaction =>
		(interaction.channel as TextChannel).parent?.id !== getState().config.staffCategoryId,
	handler: (interaction, args) => {
		//Initial, unmodified, retrieved values.
		const offender = getState().client.users.cache.get(args.get("offender")?.value as Snowflake);
		const shortres = args.get("short");
		const longres = args.get("reason")?.value as string | undefined;
		const messId = args.get("message")?.value as Snowflake | undefined;

		//Final, retrieved values.
		const offendingMessage =
			messId && interaction.guild !== null ? getMessageFromId(messId, interaction.guild) : undefined; //If messId is not undefined and guild is not null, get the message from Id, return type message or undefined, if nothing returned, give null.
		const finalreason = (function (): string | null {
			if (shortres?.name.startsWith("custom") && longres !== "" && longres !== undefined) {
				if (longres.length > 1500) {
					return longres.substring(0, 1500) + "...";
				} else {
					return longres;
				}
			} else if (!shortres?.name.startsWith("custom") && shortres?.value !== undefined) {
				return modOptions.find(reasonOption => reasonOption.name === shortres.value)?.value ?? "";
			} else {
				return null;
			}
		})();

		interaction
			.reply({
				content: "Issuing warning...",
				ephemeral: command.shouldBeEphemeral(interaction),
			})
			.catch(err => log(err, "error"));

		if (offender === undefined) {
			interaction.editReply("Failed, offender not found.").catch(err => log(err, "error"));
			return;
		}
		if (finalreason === null) {
			interaction
				.editReply(
					"Failed, custom short reason selected and no long reason provided. Proper reasons are required to effect actions."
				)
				.catch(err => log(err, "error"));
			return;
		}

		if (offendingMessage !== undefined) {
			moderatedMessageLogModel
				.create({
					messageId: offendingMessage.id,
					channelId: offendingMessage.channel.id,
					messageContent: offendingMessage.content,
				})
				.catch(err => log(err, "error"));
			addModerationRecordWithMessageToDB(offender.id, interaction.user.id, finalreason, offendingMessage.id, 20);
		} else {
			addModerationRecordToDB(offender.id, interaction.user.id, finalreason, 20);
		}

		const transparencyChannel = interaction.guild?.channels.resolve(getState().config.modActionLogChannelId) as
			| TextChannel
			| undefined;
		if (transparencyChannel !== undefined) {
			new MessageEmbed();
			transparencyChannel
				.send({
					embeds: [
						new MessageEmbed({
							fields: [
								{
									name: "Moderator",
									value: `<@${interaction.user.id}>`,
									inline: true,
								},
								{
									name: "Offender",
									value: `<@${offender.id}>`,
									inline: true,
								},
								{
									name: "Reason",
									value: finalreason,
								},
							],
							timestamp: interaction.createdTimestamp,
							color: "#FFD866",
						}),
					],
				})
				.catch(err => log("Failed to report action to transparency channels.\n", err));
		}

		offender
			.createDM()
			.then(dms => {
				if (dms) {
					dms.send(
						`You have been warned in ${interaction.guild?.name ?? "Unknown Guild"} for ${finalreason}.`
					).catch(err => log(err, "error"));
				}
			})
			.catch(err => log(err, "error"));

		interaction.editReply(`Warning issued successfully. 👍`).catch(err => log(err, "error"));
	},
};

export default command;
