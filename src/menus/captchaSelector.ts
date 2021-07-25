import type { Guild, GuildMember, SelectMenuInteraction, TextChannel, User } from "discord.js";
import { embedCache } from "../events/guildMemberAdd";
import { log } from "../logger";
import { generateOrFetchCaptchaForMember } from "../store/captcha";
import { getState } from "../store/state";

export function handleCaptchaSelector(
	interaction: SelectMenuInteraction,
	values: string[],
	guild: Guild,
	user: User,
	member: GuildMember
): void {
	const { captcha } = generateOrFetchCaptchaForMember(member.id, false);
	const selectedCaptcha = values[0];

	if (captcha === selectedCaptcha) {
		interaction
			.update({
				components: [],
				embeds: [],
				content: "You have selected the correct captcha.",
			})
			.then(() => {
				const messageId = embedCache.get(user.id);
				const logChannel = guild?.channels.cache.get(getState().config.joinLogChannelId) as TextChannel;

				if (logChannel && messageId) {
					logChannel.messages
						.fetch(messageId)
						.then(message => {
							message
								.edit({
									embeds: message.embeds,
									components: [],
								})
								.then(() => {
									embedCache.delete(user.id);
								})
								.catch(err => log(err, "error"));
						})
						.catch(err => log(err, "error"));
				}
			})
			.catch(err => log(err, "error"));

		if (member) {
			member.roles.add(getState().config.memberRoleId).catch(console.warn.bind(console));
		}
	} else {
		interaction
			.update({
				components: [],
				embeds: [],
				content: "You have selected an invalid captcha.",
			})
			.catch(err => log(err, "error"));

		if (member) {
			//member.kick("Invalid captcha.");
		}
	}
}
