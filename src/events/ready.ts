import type { Client } from "discord.js";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Event } from "../types/event";
import { deploySlashCommands } from "../util";

const event: Event = {
	name: "ready",
	once: true,
	execute: (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const client = [...args][0] as unknown as Client;

		if (client) {
			client.user?.setActivity(getState().version, { type: "PLAYING" });
		}

		log("Client logged in.", "info");
		log(`Client Version: ${getState().version}`, "debug");
		deploySlashCommands()
			.then(() => log("Loaded slash commands.", "info"))
			.catch(err => log(err, "error"));
	},
};

export default event;
