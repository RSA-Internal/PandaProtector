import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { log } from "../logger";
import { generateOrFetchCaptchaForMember } from "../store/captcha";
import type { Command } from "../types/command";

const command: Command = {
	name: "verify",
	description: "Verify for entry into server.",
	options: [],
	shouldBeEphemeral: () => true,
	handler: async interaction => {
		await interaction.defer({ ephemeral: true });

		const user = interaction.user;
		const memberId = user.id;

		const { image, fakeCaptchas } = generateOrFetchCaptchaForMember(memberId, false);

		interaction.channel
			?.send({
				files: [
					{
						attachment: image.toBuffer(),
						name: "captcha.png",
					},
				],
			})
			.then(async message => {
				const captchaUrl = message.attachments.first()?.url;

				await interaction.editReply({
					embeds: [new MessageEmbed().setTitle("Verification").setImage(captchaUrl ?? "")],
					components: [
						new MessageActionRow().addComponents(
							new MessageButton().setCustomID("regenCaptcha").setLabel("Regenerate").setStyle("PRIMARY")
						),
						new MessageActionRow().addComponents(
							new MessageSelectMenu()
								.setCustomID("captchaSelector")
								.setMinValues(1)
								.setMaxValues(1)
								.addOptions(fakeCaptchas)
						),
					],
				});

				message.delete().catch(err => log(err, "error"));
			});
	},
};

export default command;
