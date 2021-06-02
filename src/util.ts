import type { Snowflake } from "discord-api-types";
import type { Client, User } from "discord.js";

export function assert<T>(expr: T, message?: string): asserts expr {
	if (expr === null || expr === undefined) {
		throw new Error(message ?? "assertion failed!");
	}
}

export function getUserFromMention(client: Client, mention: string): User | undefined {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id as Snowflake) : undefined;
}
