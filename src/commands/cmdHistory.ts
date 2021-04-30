import { MessageEmbed } from "discord.js";
import type { Command } from "../command";
import { ephemeral } from "../ephemeral";
import type { CmdHistory } from "../models/cmdHistory";
import { defaultArgumentParser } from "../parsers";
import { clamp, getUserFromMention } from "../util";

const command: Command = {
	name: "cmdHistory",
	description: "Gets the command history of a user.",
	options: [
		{
			name: "user",
			description: "The user to get the command history of.",
		},
		{
			name: "page",
			description: "The page number for the command history (default 1).",
			optional: true,
		},
		{
			name: "count",
			description: "The number of items per page (default 25).",
			optional: true,
		},
	],
	hasPermission: (state, message) => !!message.member?.roles.cache.has(state.config.staffRoleId),
	parseArguments: defaultArgumentParser,
	handler: (state, message, user, page?, count?) => {
		const userObject = getUserFromMention(state.discordClient, user);

		if (userObject) {
			const pageNumber = clamp(Number.parseInt(page ?? 1), 1, Number.MAX_SAFE_INTEGER) - 1;
			const countNumber = clamp(Number.parseInt(count ?? 25), 1, 50);

			state.mongoClient
				.db()
				.collection("cmdHistory")
				.find(
					{ discordId: userObject.id },
					{
						limit: countNumber,
						skip: pageNumber * countNumber,
						sort: { timestamp: -1 },
					}
				)
				.toArray()
				.then(history => {
					void message.reply(
						new MessageEmbed({
							fields: [
								{
									name: "User",
									value: `<@${userObject.id}>`,
									inline: true,
								},
								{
									name: "Page",
									value: `${pageNumber + 1}`,
									inline: true,
								},
								{
									name: "Count",
									value: `${countNumber}`,
									inline: true,
								},
								{
									name: `Command History`,
									value:
										`${history
											.map(
												(entry: CmdHistory) =>
													`\`${entry.command}\` ${entry.arguments.join(" ")}`
											)
											.join("\n")}` || "None",
								},
							],
						})
					);
				})
				.catch(console.error);
		} else {
			ephemeral(state, message.reply("Unknown user.")).catch(console.error);
		}
	},
};

export default command;
