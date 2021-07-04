import type { APIInteractionGuildMember, Snowflake } from "discord-api-types";
import type { Client, GuildMember, GuildMemberRoleManager, User } from "discord.js";
import type { Command } from "./command";
import { getCommands } from "./commands";
import { getPermissions } from "./store/permissions";

export function assert<T>(expr: T, message?: string): asserts expr {
	if (expr === null || expr === undefined) {
		throw new Error(message ?? "assertion failed!");
	}
}

export function getUserFromMention(client: Client, mention: string): User | undefined {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id as Snowflake) : undefined;
}

export function getMemberCommands(member: GuildMember | APIInteractionGuildMember | null): Command[] {
	return getCommands().filter(command =>
		(member?.roles as GuildMemberRoleManager).cache.has(getPermissions(command.name).perms[0].id)
	);
}
