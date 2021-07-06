import type { Message } from "discord.js";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Event } from "../types/event";
import { deploySlashCommands } from "../util";

const event: Event = {
	name: "messageCreate",
	execute: (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const message = [...args][0] as unknown as Message;
		if (message) {
			if (message.author.bot) {
				// Do not process bot messages.
				return;
			}

			const { client, config } = getState();

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
				}
			}

			// Handle meta commands.
			if (message.member?.roles.cache.has(config.developerRoleId)) {
				if (message.content.toLowerCase() === "!deploy") {
					deploySlashCommands()
						.then(() => message.reply("Successfully loaded slash-commands."))
						.catch(console.error.bind(console));
				} else if (message.content.toLowerCase() === "!unload") {
					client.guilds.cache
						.get(config.guildId)
						?.commands.set([])
						.then(() => message.reply("Successfully unloaded slash-commands."))
						.catch(console.error.bind(console));
				} else if (message.content.toLowerCase() === "!unload-global") {
					client.application?.commands
						.set([])
						.then(() =>
							message.reply(
								"Global slash-commands successfully unloaded. Please give approx 1 hour for changes to take effect."
							)
						)
						.catch(console.error.bind(console));
				}
			}
		}
	},
};

export default event;
