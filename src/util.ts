import type { Client, User } from "discord.js";

export function getUserFromMention(client: Client, mention: string): User | null {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.resolve(id) : null;
}
