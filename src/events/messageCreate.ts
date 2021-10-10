import { ClientEvent } from "pandawrapper";
import { getState } from "../store/state";

export const messageCreateEvent = new ClientEvent("messageCreate", false);
messageCreateEvent.setCallback(message => {
	if (message.author.bot) return;

	const { config } = getState();

	if (message.channel.id === config.showcaseChannelId) {
		// Handle showcase.
		if (message.attachments.size === 0 && !/https?:\/\//.test(message.content)) {
			// Ensure messages in showcase contain an attachment or link.
			const member = message.member;

			if (member) {
				const roleCache = member.roles.cache;
				if (!roleCache.has(config.modRoleId) && !roleCache.has(config.adminRoleId)) {
					message.delete().catch(console.error.bind(console));
					return; // Do not do any further processing.
				}
			}
		} else {
			message.react("⭐").catch(console.error.bind(console));
		}
	}
});
