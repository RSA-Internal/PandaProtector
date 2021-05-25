import { GuildMember, MessageEmbed } from "discord.js";
import type { Command } from "../command";
import CommandLog from "../models/commandLog.model";
import { clamp } from "../util";

const command: Command = {
	name: "cmdhistory",
	description: "Gets the command history of a user.",
	options: [
		{
			type: "USER",
			name: "user",
			description: "The user to get the command history of.",
			required: true,
		},
		{
			type: "INTEGER",
			name: "page",
			description: "The page number for the command history (default 1).",
		},
		{
			type: "INTEGER",
			name: "count",
			description: "The number of items per page (default 25).",
		},
	],
	hasPermission: (state, interaction) =>
		(interaction.member as GuildMember).roles.cache.has(state.config.staffRoleId),
	shouldBeEphemeral: () => false,
	handler: (state, interaction, args) => {
		const userObject = state.client.users.cache.get(args[0].value as string);
		const page = args[1]?.value as number | undefined;
		const count = args[2]?.value as number | undefined;

		if (userObject) {
			const pageNumber = clamp(page ?? 1, 1, Number.MAX_SAFE_INTEGER);
			const countNumber = clamp(count ?? 25, 1, 50);

			interaction
				.defer(command.shouldBeEphemeral(state, interaction))
				.then(() =>
					CommandLog.find({ discordId: userObject.id }, "command arguments", {
						limit: countNumber,
						sort: { timestamp: -1 },
					}).exec()
				)
				.then(logs =>
					interaction.editReply(
						new MessageEmbed({
							fields: [
								{
									name: "User",
									value: `<@${userObject.id}>`,
									inline: true,
								},
								{
									name: "Page",
									value: `${pageNumber}`,
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
										`${logs
											.map(entry => `\`${entry.command}\` ${entry.arguments.join(" ")}`)
											.join("\n")}` || "None",
								},
							],
						})
					)
				)
				.catch(console.error.bind(console));
		} else {
			interaction.reply("Unknown user.").catch(console.error.bind(console));
		}
	},
};

export default command;
