import { log } from "console";
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Event } from "../types/event";

const event: Event = {
	name: "guildMemberAdd",
	execute: async (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const member = [...args][0] as unknown as GuildMember;
		const guild = member.guild;

		const config = getState().config;
		const logChannel = (await guild.channels.fetch(config.joinLogChannelId as `${bigint}`)) as TextChannel;

		const creation = member.user.createdAt;
		const now = new Date(Date.now());

		// To calculate the time difference of two dates
		const Difference_In_Time = now.getTime() - creation.getTime();

		// To calculate the no. of days between two dates
		const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

		if (logChannel) {
			logChannel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Member Joined")
						.setDescription(`<@!${member.id}> ${member.user.tag}`)
						.addField("Account Age", `${Difference_In_Days} days`, true),
				],
				components: [
					new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomID(member.id)
							.setStyle("SECONDARY")
							.setLabel(member.id)
							.setDisabled(true),
						new MessageButton().setCustomID("kick").setStyle("SUCCESS").setLabel("Kick"),
						new MessageButton().setCustomID("ban").setStyle("DANGER").setLabel("Ban")
					),
				],
			});
		}
	},
};

export default event;
