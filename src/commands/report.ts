import type { TextChannel } from "discord.js";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";
import { getUserFromMention } from "../util";

const command: Command = {
	name: "report",
	description: "Report a user to staff.",
	options: [
		{
			name: "user",
			description: "The user to report.",
		},
		{
			name: "reason",
			description: "The reason for the report.",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (state, message, user, ...reason) => {
		const reasonText = reason.join(" ");
		const userObject = getUserFromMention(state.client, user);
		const reportChannel = state.client.channels.resolve(state.reportChannelId) as TextChannel | null;

		if (!reportChannel || reportChannel.type !== "text") {
			console.error("Report channel does not exist or is not a text channel.");
			return;
		}

		if (!userObject || userObject.id === message.author.id) {
			// Ensure the target is not the reporter.
			message
				.reply("Could not report this user.")
				.then(sent => void sent.delete({ timeout: 5000 }))
				.catch(reason => console.error(reason));
			return;
		}

		if (reasonText.length < 15 || reason.length < 3) {
			// Ensure the reason is at least 15 characters or 3 words long.
			message
				.reply("Please provide a longer reason to report someone.")
				.then(sent => void sent.delete({ timeout: 5000 }))
				.catch(reason => console.error(reason));
			return;
		}

		reportChannel
			.send(
				`@here, <@${message.author.id}> is reporting ${user} with reason: ${reasonText}.\nJump Link: <${message.url}>`
			)
			.then(() => {
				void message.reply(`You have reported the user.`).then(sent => void sent.delete({ timeout: 5000 }));
			})
			.catch(reason => {
				console.error(`Reporting ${user} with reason ${reasonText} failed.`);
				console.error(reason);
				message
					.reply(`Could not report the user, please mention an online mod.`)
					.then(sent => void sent.delete({ timeout: 5000 }))
					.catch(reason => console.error(reason));
			});
	},
};

export default command;
