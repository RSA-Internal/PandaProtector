import type { Message } from "discord.js";
import Discord from "discord.js";
import { readFileSync } from "fs";
import { registerEvent, unregisterEvent } from "../src/types/event";

const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILDS"] });
client.once("ready", () => console.log("Ready!"));

registerEvent(client, "messageCreate", {
	connectionName: "loadNewEventFromMessage",
	callback: (...args: unknown[]) => {
		const message = args[0] as Message;
		const content = message.content.split(" ");
		if (content.length === 3) {
			console.log("Beginning event interaction");
			const command = content[0];

			if (command === "registerEvent") {
				console.log("Registering new event.");
				const eventName = content[1];
				const connectionName = content[2];
				const callback = (...subArgs: unknown[]) => {
					console.log(`Fired from test new event: ${subArgs.join(", ")}`);
				};

				registerEvent(client, eventName, {
					connectionName,
					callback,
				});
			} else if (command === "unregisterEvent") {
				console.log("Unregistering event.");
				const eventName = content[1];
				const connectionName = content[2];
				unregisterEvent(client, eventName, connectionName);
			}
		}
	},
});

registerEvent(client, "interaction", {
	connectionName: "depTesting",
	callback: (...args: unknown[]) => {
		console.log(args);
	},
});

const token = (JSON.parse(readFileSync("secrets.json", "utf-8")) as { token: string })["token"];

client.login(token).catch(console.error.bind(console));
