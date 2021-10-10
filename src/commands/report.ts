import { MessageEmbed, SlashCommand, SlashCommandOption, WrappedClient } from "pandawrapper";
import { getState } from "../store/state";

const reportOptionUser = new SlashCommandOption("user", "The user to report.", "USER").setRequired();
const reportOptionReason = new SlashCommandOption(
	"reason",
	"The reason for reporting the user.",
	"STRING"
).setRequired();

export const reportSlashCommand = new SlashCommand("report", "Report a user to staff.");
reportSlashCommand.addOption(reportOptionReason).addOption(reportOptionUser);

for (let i = 1; i < 9; i++) {
	const reportOptionUser = new SlashCommandOption(`user${i}`, `The number ${i} user to report.`, "USER");
	reportSlashCommand.addOption(reportOptionUser);
}

reportSlashCommand.setCallback((interaction, args) => {
	if (args.length < 2) return interaction.reply({ content: "Not enough args provided.", ephemeral: true });

	interaction
		.deferReply({ ephemeral: true })
		.then(() => {
			const client = WrappedClient.getClient();
			const state = getState();
			const reportChannel = client.channels.cache.get(state.config.reportChannelId);

			const reasonText = args[0].value as string;

			const userObjects: string[] = [];

			for (let i = 1; i < args.length; i++) {
				const userObject = client.users.cache.get(args[i].value as string);
				if (userObject && !userObject.bot && userObject.id !== interaction.user.id) {
					const toPush = `<@${userObject.id}>`;
					if (!userObjects.includes(toPush)) userObjects.push(toPush);
				}
			}

			let interactionResponse = "";

			if (!reportChannel) interactionResponse = "No reportChannel";
			if (reportChannel && !reportChannel.isText()) interactionResponse = "Invalid reportChannel";
			if (!interaction.channel?.isText()) return;
			if (userObjects.length === 0) interactionResponse = "No users to report.";
			if (interactionResponse.length > 0) {
				return interaction.editReply({ content: interactionResponse });
			}

			if (reportChannel?.isText()) {
				interaction.channel
					.send("Reporting...")
					.then(async message => {
						await reportChannel
							.send({
								embeds: [
									new MessageEmbed({
										fields: [
											{
												name: "Reporter",
												value: `<@${interaction.user.id}>`,
												inline: true,
											},
											{
												name: "Accused",
												value: userObjects.join(",\n"),
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
										timestamp: interaction.createdTimestamp,
										color: "#FF0000",
									}),
								],
							})
							.then(async reportMessage => {
								message.edit("Reported.").catch(console.error.bind(console));
								interactionResponse = "You have successfully reported the user(s).";
								interaction
									.editReply({ content: interactionResponse })
									.catch(console.error.bind(console));
								await Promise.all([
									reportMessage.react("👀"),
									reportMessage.react("✅"),
									reportMessage.react("❌"),
								]);
							});
					})
					.catch(console.error.bind(console));

				if (interactionResponse.length > 0)
					interaction.editReply({ content: interactionResponse }).catch(console.error.bind(console));
			}
		})
		.catch(console.error.bind(console));
});
