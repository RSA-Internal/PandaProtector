import {
	ButtonInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
} from "discord.js";
import { log } from "../logger";
import { generateOrFetchCaptchaForMember } from "../store/captcha";

export function handleRegenCaptcha(interaction: ButtonInteraction, member: GuildMember): void {
	const { image, fakeCaptchas } = generateOrFetchCaptchaForMember(member.id, true);

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

			await interaction.update({
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
}
