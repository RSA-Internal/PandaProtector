import { MessageEmbed, SlashCommand, SlashCommandOption, WrappedClient } from "pandawrapper";
import { getState } from "../store/state";

const reportOptionUser = new SlashCommandOption("user", "The user to report.", "USER").setRequired();
const reportOptionReason = new SlashCommandOption(
	"reason",
	"The reason for reporting the user.",
	"STRING"
).setRequired();

export const reportSlashCommand = new SlashCommand("report", "Report a user to staff.");
reportSlashCommand.addOption(reportOptionUser).addOption(reportOptionReason);
reportSlashCommand.setCallback(async (interaction, args) => {
	if (args.length < 2) return interaction.reply({ content: "Not enough args provided.", ephemeral: true });

	await interaction.deferReply({ ephemeral: true });

	const client = WrappedClient.getClient();
	const state = getState();
	const reportChannel = client.channels.cache.get(state.config.reportChannelId);

	const userObject = client.users.cache.get(args[0].value as string);
	const reasonText = args[1].value as string;

	let interactionResponse = "";

	if (!reportChannel) interactionResponse = "No reportChannel";
	if (reportChannel && !reportChannel.isText()) interactionResponse = "Invalid reportChannel";
	if (!userObject || userObject.bot || userObject.id === interaction.user.id)
		interactionResponse = "Could not report that user.";
	if (!interaction.channel?.isText()) return;

	if (interactionResponse.length > 0) {
		return interaction.reply({ content: interactionResponse, ephemeral: true });
	}

	if (reportChannel?.isText()) {
		await interaction.channel.send("Reporting...").then(async message => {
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
									value: `<@${args[0].value as string}>`,
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
					interactionResponse = "You have successfully reported the user.";
					await Promise.all([
						reportMessage.react("👀"),
						reportMessage.react("✅"),
						reportMessage.react("❌"),
					]);
				});
		});

		await interaction.reply({ content: interactionResponse, ephemeral: true });
	}
});
