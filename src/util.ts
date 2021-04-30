import type { Client, User } from "discord.js";

export function clamp(value: number, min: number, max: number): number {
	if (value < min || Number.isNaN(value)) {
		return min;
	} else if (value > max) {
		return max;
	} else {
		return value;
	}
}

export function getUserFromMention(client: Client, mention: string): User | undefined {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id) : undefined;
}
