import Canvas from "canvas";
import { MessageActionRow, MessageEmbed, MessageSelectMenu, Snowflake } from "discord.js";
import { log } from "../logger";
import type { Command } from "../types/command";

export const captchaCache = new Map<Snowflake, string>();
const validChars = "ABCDEFGHabcdefg2456789";

function generateCaptcha(length: number): string {
	const captcha = [];

	for (let i = 0; i < length; i++) {
		captcha.push(validChars[Math.floor(Math.random() * validChars.length)]);
	}

	return captcha.join("");
}

const command: Command = {
	name: "verify",
	description: "Verify for entry into server.",
	options: [],
	shouldBeEphemeral: () => true,
	handler: async interaction => {
		await interaction.defer({ ephemeral: true });

		const user = interaction.user;

		// upon running /verify generate captcha code | fetch from cache
		const captcha = generateCaptcha(6);

		captchaCache.set(user.id, captcha);

		const captchaData = [] as { label: string; value: string }[];

		for (let i = 0; i < 3; i++) {
			const fakeCaptcha = generateCaptcha(6);
			captchaData.push({ label: fakeCaptcha, value: fakeCaptcha });
		}

		captchaData.push({ label: captcha, value: captcha });

		for (let i = 0; i < captchaData.length; i++) {
			const rand = Math.floor(Math.random() * captchaData.length);
			[captchaData[rand], captchaData[i]] = [captchaData[i], captchaData[rand]];
		}

		const canvas = Canvas.createCanvas(200, 50);
		const context = canvas.getContext("2d");

		context.fillStyle = "#9214fa";
		context.fillRect(0, 0, 200, 50);
		context.font = "32px sans-serif";
		context.fillStyle = "#ffffff";
		context.fillText(captcha, 50, 40);

		interaction.channel
			?.send({
				files: [
					{
						attachment: canvas.toBuffer(),
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
							new MessageSelectMenu()
								.setCustomID("captchaSelector")
								.setMinValues(1)
								.setMaxValues(1)
								.addOptions(captchaData)
						),
					],
				});

				message.delete().catch(err => log(err, "error"));
			});
	},
};

export default command;
