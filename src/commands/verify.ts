import { MessageActionRow, MessageEmbed, MessageSelectMenu, Snowflake } from "discord.js";
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

		// return embed as ephemeral
		await interaction.editReply({
			embeds: [new MessageEmbed().setTitle("Verification").addField("Captcha", captcha, true)],
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
	},
};

export default command;
