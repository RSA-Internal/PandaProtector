import type { Client, User } from "discord.js";

export function getUserFromMention(client: Client, mention: string): User | undefined {
	console.log(mention);
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id) : undefined;
}
