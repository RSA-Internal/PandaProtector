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
			if (!message.member?.roles.cache.has(config.staffRoleId)) {
				message.delete().catch(console.error.bind(console));
				return; // Do not do any further processing.
			}
		} else {
			// Add up vote and down vote reaction to message.
			// TODO: make emotes configurable in the future?
			message.react("👍").catch(console.error.bind(console));
			message.react("👎").catch(console.error.bind(console));
			message.react("⭐").catch(console.error.bind(console));
		}
	}
});
