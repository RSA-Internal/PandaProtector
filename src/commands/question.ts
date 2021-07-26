import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";

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
	],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: async interaction => {
		const guild = interaction.guild;

		if (guild) {
			await interaction.reply("WIP").catch(err => log(err, "error"));

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
					* check if author of question has opt-d into receiving notifications
						* if yes, DM that an answer has been posted to their question

			*
			*
				* accepting answers
					* TBD

			*
			*
				* upvoting / downvoting answers
					* TBD

			*
			*
				* looking up questions
					* TBD
			 */
		}
	},
};

export default command;
