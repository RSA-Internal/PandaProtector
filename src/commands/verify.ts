import { Canvas } from "canvas-constructor";
import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Snowflake } from "discord.js";
import { log } from "../logger";
import type { Command } from "../types/command";

export const captchaCache = new Map<Snowflake, string>();
const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateCaptcha(length: number): string {
	const captcha = [];

	for (let i = 0; i < length; i++) {
		captcha.push(validChars[Math.floor(Math.random() * validChars.length)]);
	}

	return captcha.join("");
}

function randomMinMax(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function generateCaptchaImage(captcha: string): Canvas {
	console.log(captcha);
	const canvas = new Canvas(200, 50)
		.setColor("#9214fa")
		.printRectangle(0, 0, 200, 50)
		.setColor("#ffffff")
		.setTextFont("32px sans-serif")
		.save();

	for (let i = 0; i < captcha.length; i++) {
		const currentLetter = captcha[i];

		const degrees = randomMinMax(-50, 50);
		const scaleX = 1 + randomMinMax(-0.4, 0.2);
		const scaleY = 1 + randomMinMax(-0.4, 0.2);

		canvas
			.setTextAlign("center")
			.setTextBaseline("middle")
			.save()
			.translate(40 + (150 / captcha.length) * i, 25)
			.rotate((degrees * Math.PI) / 180)
			.scale(scaleX, scaleY)
			.printText(currentLetter, 0, 0)
			.restore();
	}

	return canvas;
}

export function generateCaptchaForMember(memberId: Snowflake): string {
	const captcha = generateCaptcha(6);

	captchaCache.set(memberId, captcha);
	return captcha;
}

export function generateFakeCaptchaList(captcha: string): { label: string; value: string }[] {
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

	return captchaData;
}

const command: Command = {
	name: "verify",
	description: "Verify for entry into server.",
	options: [],
	shouldBeEphemeral: () => true,
	handler: async interaction => {
		await interaction.defer({ ephemeral: true });

		const user = interaction.user;
		const memberId = user.id;

		// upon running /verify generate captcha code | fetch from cache

		const captcha = generateCaptchaForMember(memberId);
		const canvas = generateCaptchaImage(captcha);
		const captchaData = generateFakeCaptchaList(captcha);

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
							new MessageButton().setCustomID("regenCaptcha").setLabel("Regenerate").setStyle("PRIMARY")
						),
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
