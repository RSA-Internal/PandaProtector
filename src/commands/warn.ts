import type { Snowflake } from "discord-api-types";
import { MessageEmbed, TextChannel } from "discord.js";
import { shortMappings } from "../../short-reasons-mapping.json";
import { modOptions } from "../../short-reasons.json";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";
import {
	addModeratedMessageToDB,
	addModerationRecordToDB,
	addModerationRecordWithMessageToDB,
	getMessageFromId,
} from "../util";

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
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) });
		//Initial, unmodified, retrieved values.
		const offender = getState().client.users.cache.get(args.get("offender")?.value as Snowflake);
		const shortres = args.get("short");
		const longres = args.get("reason")?.value as string | undefined;
		const messId = args.get("message")?.value as Snowflake | undefined;

		//Final, retrieved values.
		const offendingMessage =
			messId && interaction.guild !== null ? getMessageFromId(messId, interaction.guild) : undefined; //If messId is not undefined and guild is not null, get the message from Id, return type message or undefined, if nothing returned, give null.
		const finalreason = (function (): string | null {
			if (shortres?.value === "cust" && longres !== "" && longres !== undefined) {
				if (longres.length > 1500) {
					return longres.substring(0, 1500) + "...";
				} else {
					return longres;
				}
			} else if (shortres?.value !== undefined && shortres.value !== "cust") {
				return modOptions[shortres.value as keyof typeof modOptions].value;
				//modOptions.find(reasonOption => reasonOption.name === shortres.value)?.value ?? "";
			} else {
				return null;
			}
		})();

		//Notify staff member, warning is starting.
		interaction
			.editReply({
				content: "Issuing warning...",
			})
			.catch(err => log(err, "error"));

		//Completing final checks.
		if (offender === undefined) {
			interaction.editReply("Failed, offender not found.").catch(err => log(err, "error"));
			return;
		}
		if (interaction.guild?.members.resolve(offender.id)?.roles.cache.has(getState().config.staffRoleId)) {
			interaction.editReply("Failed, attempted to action a staff member.").catch(err => log(err, "error"));
		}
		if (finalreason === null || finalreason === "") {
			interaction
				.editReply(
					"Failed, custom short reason selected and no long reason provided. Proper reasons are required to effect actions."
				)
				.catch(err => log(err, "error"));
			return;
		}

		//If message is found, document, delete, and document in relation to mod action. Otherwise, document as standalone warning.
		if (offendingMessage !== undefined) {
			addModeratedMessageToDB(offendingMessage);
			offendingMessage.delete().catch(err => log(err, "error"));
			addModerationRecordWithMessageToDB(offender.id, interaction.user.id, finalreason, offendingMessage.id, 20);
		} else {
			addModerationRecordToDB(offender.id, interaction.user.id, finalreason, 20);
		}

		//Add record to the moderation actions channel.
		const transparencyChannel = interaction.guild?.channels.resolve(getState().config.modActionLogChannelId) as
			| TextChannel
			| undefined;
		if (transparencyChannel !== undefined) {
			transparencyChannel
				.send({
					embeds: [
						new MessageEmbed({
							title: "Warning Issued",
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

		//Attempt to DM the person being warned.
		offender
			.createDM()
			.then(dms => {
				if (dms) {
					dms.send(
						`You have been warned in ${interaction.guild?.name ?? "Unknown Guild"} for ${finalreason}`
					).catch(err => log(err, "error"));
				}
			})
			.catch(err => log(err, "error"));

		interaction.editReply(`Warning issued successfully. 👍`).catch(err => log(err, "error"));
	},
};

export default command;
