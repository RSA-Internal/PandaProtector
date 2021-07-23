import { Canvas } from "canvas-constructor";
import type { MessageSelectOptionData, Snowflake } from "discord.js";
import { randomMinMax } from "../util";

export const captchaCache = new Map<Snowflake, Captcha>();
const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

interface Captcha {
	captcha: string;
	image: Canvas;
	fakeCaptchas: MessageSelectOptionData[];
}

function generateCaptcha(length: number): string {
	const captcha = [];

	for (let i = 0; i < length; i++) {
		captcha.push(validChars[Math.floor(Math.random() * validChars.length)]);
	}

	return captcha.join("");
}

function generateCaptchaImage(captcha: string): Canvas {
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

function generateFakeCaptchaList(captcha: string): MessageSelectOptionData[] {
	const captchaData = [];

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

function generateCaptchaForMember(memberId: Snowflake): Captcha {
	const captcha = generateCaptcha(6);
	const image = generateCaptchaImage(captcha);
	const fakeCaptchas = generateFakeCaptchaList(captcha);

	const captchaData = { captcha, image, fakeCaptchas };

	captchaCache.set(memberId, captchaData);

	return captchaData;
}

export function generateOrFetchCaptchaForMember(memberId: Snowflake, force: boolean): Captcha {
	let captchaData = captchaCache.get(memberId);
	if (force || !captchaData) {
		captchaData = generateCaptchaForMember(memberId);
	}
	return captchaData;
}
