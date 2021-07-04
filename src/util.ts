import type { Snowflake } from "discord-api-types";
import type { ApplicationCommand, Client, GuildMember, User } from "discord.js";
import type { Command } from "./command";
import { getCommands } from "./commands";
import { getPermissions } from "./store/permissions";
import { getState } from "./store/state";

export function assert<T>(expr: T, message?: string): asserts expr {
	if (expr === null || expr === undefined) {
		throw new Error(message ?? "assertion failed!");
	}
}

export function getUserFromMention(client: Client, mention: string): User | undefined {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id as Snowflake) : undefined;
}

function getApplicationCommandFromCommandName(client: Client, commandName: string): ApplicationCommand | undefined {
	return client.guilds.cache
		.get(getState().config.guildId)
		?.commands.cache.filter(cmd => cmd.name === commandName)
		.first();
}

export function getMemberCommands(member: GuildMember): Command[] {
	return getCommands().filter(async command => {
		const applicationCommand = getApplicationCommandFromCommandName(member.client, command.name);

		let hasPermission = false;

		if (applicationCommand) {
			const perms = await applicationCommand.permissions.fetch({ command: applicationCommand.id });

			if (!hasPermission) hasPermission = perms.filter(perm => perm.id === member.id).length > 0;
		}

		if (!hasPermission) hasPermission = member?.roles.cache.has(getPermissions(command.name).perms[0].id);

		return hasPermission;
	});
}
