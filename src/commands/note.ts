import type { Snowflake } from "discord-api-types";
import type { CommandInteractionOption, TextChannel } from "discord.js";
import { log } from "../logger";
import moderationActionLogModel from "../models/moderationActionLog.model";
import { getState } from "../store/state";
import type { Command } from "../types/command";
import { addModerationRecordToDB } from "../util";

const command: Command = {
	name: "note",
	description: "Add a staff note to user. Document event that may not require moderation.",
	/*
	Collection(1) [Map] {
		'user' => {
			name: 'user',
			type: 'SUB_COMMAND',
			options: Collection(2) [Map] { 'user' => [Object], 'details' => [Object] }
		}
	}
	[debug]: Firing event: interactionCreate
	Collection(1) [Map] {
		'case' => {
			name: 'case',
			type: 'SUB_COMMAND',
			options: Collection(2) [Map] { 'caseid' => [Object], 'details' => [Object] }
		}
	}
	*/
	options: [
		{
			type: "SUB_COMMAND",
			name: "user",
			description: "Append details to a user not affiliated with a case.",
			options: [
				{
					name: "user",
					type: "USER",
					description: "User to append a record to.",
					required: true,
				},
				{
					name: "details",
					type: "STRING",
					description: "Details to add to user separated from cases.",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			name: "case",
			description: "Append details to a specified case that is affiliated with a user.",
			options: [
				{
					name: "caseid",
					type: "INTEGER",
					description: "Case number to append details to.",
					required: true,
				},
				{
					name: "details",
					type: "STRING",
					description: "Details to append to the case.",
					required: true,
				},
			],
		},
	],
	shouldBeEphemeral: interaction =>
		(interaction.channel as TextChannel).parent?.id !== getState().config.staffCategoryId,
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) });
		const subCommandArg = args.first() as CommandInteractionOption | undefined;
		if (subCommandArg !== undefined && subCommandArg.options !== undefined) {
			if (subCommandArg.name === "user") {
				//Define basic variables.
				const userForNote = getState().client.users.cache.get(
					subCommandArg.options.get("user")?.value as Snowflake
				);
				const details = subCommandArg.options.get("details")?.value as string;

				//Verify user variable is satisfied.
				if (!userForNote) {
					interaction.editReply("Failed, there was an issue getting user for note.");
					return;
				}
				//Add record, no weight.
				addModerationRecordToDB(userForNote?.id, interaction.user.id, details, 0);
				interaction.editReply("Note added to user successfully.").catch(err => log(err, "error"));
			} else if (subCommandArg.name === "case") {
				//Define basic variables.
				const caseID = subCommandArg.options.get("caseid")?.value as number;
				const details = subCommandArg.options.get("details")?.value as string;

				//Update the, what should be 1 record, with the specified caseId.
				moderationActionLogModel
					.updateOne(
						{ caseNumber: caseID },
						{
							note: `On ${new Date().toDateString()}, moderator <@${
								interaction.user.id
							}> added the note: ${details}`,
						}
					)
					.catch(err => log(err, "error"));
				interaction.editReply("Note added to the case successfully.").catch(err => log(err, "error"));
			}
		} else {
			//Should Subcommand somehow fail.
			interaction.editReply("There was an issue with the SubCommand chosen.").catch(err => log(err, "error"));
		}
	},
};

export default command;
