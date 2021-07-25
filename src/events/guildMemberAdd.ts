import { log } from "console";
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed, Snowflake, TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Event } from "../types/event";

export const embedCache = new Map<Snowflake, Snowflake>();

const event: Event = {
	name: "guildMemberAdd",
	execute: async (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const member = [...args][0] as unknown as GuildMember;
		const guild = member.guild;

		const config = getState().config;
		const logChannel = (await guild.channels.fetch(config.joinLogChannelId)) as TextChannel;

		const creation = member.user.createdAt;
		const now = new Date(Date.now());

		// To calculate the time difference of two dates
		const Difference_In_Time = now.getTime() - creation.getTime();

		// To calculate the no. of days between two dates
		const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

		if (logChannel) {
			logChannel
				.send({
					embeds: [
						new MessageEmbed()
							.setTitle("Member Joined")
							.setThumbnail(member.user.displayAvatarURL() ?? "")
							.addField(member.user.tag, member.displayName, true)
							.addField("\u200b", "\u200b", true)
							.addField("Account Age", `${Math.floor(Difference_In_Days)} days`, true),
					],
					components: [
						new MessageActionRow().addComponents(
							new MessageButton().setCustomID("kick").setStyle("SUCCESS").setLabel("Kick"),
							new MessageButton()
								.setCustomID("memberId")
								.setStyle("SECONDARY")
								.setLabel(member.id)
								.setDisabled(true),
							new MessageButton().setCustomID("ban").setStyle("DANGER").setLabel("Ban")
						),
					],
				})
				.then(message => {
					embedCache.set(member.id, message.id);
				})
				.catch(err => log(err, "error"));
		}
	},
};

export default event;
