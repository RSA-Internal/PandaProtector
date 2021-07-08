import type { TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Command } from "../types/command";

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
		console.log(args);
		interaction.editReply("Command is not currently supported. Testing phase.").catch(err => {
			console.log(err);
		});
	},
};

export default command;
