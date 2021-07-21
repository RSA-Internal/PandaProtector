import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: async interaction => {
		const guild = interaction.guild;
		const member = guild?.members.resolve(interaction.user.id);

		if (guild && member) {
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
							.setThumbnail(member.user.displayAvatarURL() ?? "")
							.addField(member.user.tag, member.displayName, true)
							.addField("\u200b", "\u200b", true)
							.addField("Account Age", `${Math.floor(Difference_In_Days)} days`, true),
					],
					components: [
						new MessageActionRow().addComponents(
							new MessageButton().setCustomID("kick").setStyle("SUCCESS").setLabel("Kick"),
							new MessageButton()
								.setCustomID(member.id)
								.setStyle("SECONDARY")
								.setLabel(member.id)
								.setDisabled(true),
							new MessageButton().setCustomID("ban").setStyle("DANGER").setLabel("Ban")
						),
					],
				});
			}
		}
	},
};

export default command;
