import type { Snowflake } from "discord-api-types";
import type { CommandInteractionOption, Message, TextChannel } from "discord.js";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "purge",
	description: "Remove messages from the channel or from a particular user.",
	options: [
		{
			type: "SUB_COMMAND",
			description: "Remove up to 100 messages in the current channel.",
			name: "channel",
			options: [
				{
					name: "count",
					description: "Amount of minutes to go back to delete.",
					type: "INTEGER",
					required: true,
				},
			],
		},
		{
			type: "SUB_COMMAND",
			description: "Remove a user's messages from the last set in one or all channels.",
			name: "user",
			options: [
				{
					name: "user",
					description: "User whose messages will be deleted.",
					type: "USER",
					required: true,
				},
				{
					name: "type",
					description: "Whether it will delete only the user's messages in this channel or all.",
					type: "STRING",
					required: true,
					choices: [
						{
							name: "this",
							value: "this",
						},
						{
							name: "all",
							value: "all",
						},
					],
				},
				{
					name: "count",
					description:
						"How many messages back in the channel will we search for this user's messages? (Default: 100)",
					type: "INTEGER",
				},
			],
		},
	],
	shouldBeEphemeral: () => true,
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) });
		const subCommandSelection = args.first() as CommandInteractionOption;

		interaction.editReply("Deleting messages...").catch(err => log(err, "error"));

		if (subCommandSelection.name === "channel" && subCommandSelection.options) {
			if (!interaction.channel) {
				interaction.editReply("Failed to get channel.").catch(err => log(err, "error"));
				return;
			}
			const count = Math.min(100, Math.max(0, subCommandSelection.options.get("count")?.value as number));
			await interaction.channel.messages
				.fetch({ limit: count })
				.then(messages => {
					(interaction.channel as TextChannel).bulkDelete(messages).catch(err => log(err, "error"));
				})
				.catch(err => log(err, "error"));
		} else if (subCommandSelection.name === "user" && subCommandSelection.options) {
			const markedUser = getState().client.users.cache.get(
				subCommandSelection.options.get("user")?.value as Snowflake
			);
			const typeOfDelete = subCommandSelection.options.get("type")?.value;
			const fallBack = subCommandSelection.options.get("count")
				? (subCommandSelection.options.get("count")?.value as number)
				: 100;
			if (typeOfDelete === "all") {
				interaction.guild?.channels.cache.forEach(gChannel => {
					if (gChannel.isText() || gChannel.isThread()) {
						gChannel.messages
							.fetch({ limit: fallBack })
							.then(messages => {
								const usersMessages: Message[] = [];
								//const usersMessages = Message[];
								messages.forEach(messageMessage => {
									if (messageMessage.author.id === markedUser?.id && messageMessage.deletable) {
										usersMessages.push(messageMessage);
									}
								});
								gChannel.bulkDelete(usersMessages).catch(err => log(err, "error"));
							})
							.catch(err => log(err, "error"));
					}
				});
			} else if (typeOfDelete === "this" && interaction.channel) {
				interaction.channel.messages
					.fetch({ limit: fallBack })
					.then(messages => {
						const usersMessages: Message[] = [];
						messages.forEach(messageMessage => {
							if (messageMessage.deletable) {
								usersMessages.push(messageMessage);
							}
						});
						(interaction.channel as TextChannel).bulkDelete(usersMessages).catch(err => log(err, "error"));
					})
					.catch(err => log(err, "error"));
			}
		} else {
			interaction.editReply("Unable to determine sub-command selection.").catch(err => log(err, "error"));
		}

		interaction.editReply("Messages have been deleted.").catch(err => log(err, "error"));
	},
};

export default command;
