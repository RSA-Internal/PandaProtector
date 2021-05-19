import { MessageEmbed, TextChannel } from "discord.js";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";
import { getUserFromMention } from "../util";

const command: Command = {
	name: "report",
	description: "Report a user to staff.",
	options: [
		{
			type: "USER",
			name: "user",
			description: "The user to report.",
		},
		{
			type: "STRING",
			name: "reason",
			description: "The reason for the report.",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (state, interaction, user, ...reason) => {
		const reasonText = reason.join(" ");
		const userObject = getUserFromMention(state.client, user);
		const reportChannel = state.client.channels.cache.get(state.config.reportChannelId);

		if (!reportChannel?.isText()) {
			// Ensure the report channel is a text channel.
			console.error("Report channel does not exist or is not a text channel.");
			return;
		}

		if (!userObject || userObject.bot || userObject.id === interaction.user.id) {
			// Ensure the target user is reportable and not the reporter.
			//ephemeral(state, interaction.reply("Could not report this user.")).catch(console.error.bind(console));
			interaction.reply("Could not report this user.").catch(console.error.bind(console));
			return;
		}

		reportChannel
			.send(
				new MessageEmbed({
					fields: [
						{
							name: "Reporter",
							value: `<@${message.author.id}>`,
							inline: true,
						},
						{
							name: "Accused",
							value: `<@${userObject.id}>`,
							inline: true,
						},
						{
							name: "Jump Link",
							value: `[Here](${message.url})`,
							inline: true,
						},
						{
							name: "Reason",
							value: reasonText,
						},
					],
					timestamp: message.createdTimestamp,
					color: "#FF0000",
				})
			)
			.then(reportMessage => {
				ephemeral(state, message.reply(`You have reported the user.`)).catch(console.error.bind(console));
				reportMessage.react("👀").catch(console.error.bind(console));
				reportMessage.react("✅").catch(console.error.bind(console));
				reportMessage.react("❌").catch(console.error.bind(console));
			})
			.catch(reason => {
				console.error(`Reporting ${user} with reason ${reasonText} failed.`);
				console.error(reason);

						interaction
							.reply(`Could not report the user, please mention an online mod.`)
							.catch(console.error.bind(console));
						// ephemeral(state, interaction.reply(`Could not report the user, please mention an online mod.`)).catch(
						// 	console.error
						// );
					});
			})
			.catch(console.error.bind(console));
	},
};

export default command;
