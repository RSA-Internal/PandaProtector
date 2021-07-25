import { log } from "console";
import { GuildMember, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Event } from "../types/event";
import { embedCache } from "./guildMemberAdd";

const event: Event = {
	name: "guildMemberRemove",
	execute: (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const newMember = [...args][0] as unknown as GuildMember;
		const guild = newMember.guild;

		const messageId = embedCache.get(newMember.id);
		const logChannel = guild.channels.cache.get(getState().config.joinLogChannelId) as TextChannel;

		if (logChannel && messageId) {
			logChannel.messages
				.fetch(messageId)
				.then(message => {
					const components = message.components[0].components;

					if (components.find(component => component.customID === "kick")) {
						message
							.edit({
								embeds: message.embeds,
								components: [
									new MessageActionRow().addComponents(
										new MessageButton()
											.setCustomID("left")
											.setStyle("SUCCESS")
											.setLabel("User Left")
											.setDisabled(true),
										new MessageButton()
											.setCustomID("memberId")
											.setStyle("SECONDARY")
											.setLabel(newMember.id)
											.setDisabled(true),
										new MessageButton().setCustomID("ban").setStyle("DANGER").setLabel("Ban")
									),
								],
							})
							.then(() => {
								embedCache.delete(newMember.id);
							})
							.catch(err => log(err, "error"));
					}
				})
				.catch(err => log(err, "error"));
		}
	},
};

export default event;
