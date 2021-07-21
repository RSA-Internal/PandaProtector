import type { Snowflake } from "discord-api-types";
import type { Client, User } from "discord.js";
import { getCommands } from "./commands";
import { log } from "./logger";
import { getPermissions } from "./store/permissions";
import { getState } from "./store/state";
import type { Config } from "./structures/config";

export function assert<T>(expr: T, message?: string): asserts expr {
	if (expr === null || expr === undefined) {
		throw new Error(message ?? "assertion failed!");
	}
}

export function getUserFromMention(client: Client, mention: string): User | undefined {
	const id = /^<@!?(\d+)>$/.exec(mention)?.[1];
	return id ? client.users.cache.get(id as Snowflake) : undefined;
}

function getPermField(idField: keyof Config, config: Config): `${bigint}` {
	return config[idField] as `${bigint}`;
}

export function deploySlashCommands(): Promise<void> {
	const { client, config } = getState();

	log("Deploying slash commands", "info");
	const commands = client.guilds.cache.get(config.guildId)?.commands;

	if (!commands) {
		log('Could not deploy slash-commands. Can retry with "!deploy".', "warn");
		return Promise.reject("Could not deploy slash-commands.");
	}

	const commandList = getCommands().map(command => ({
		name: command.name,
		description: command.description,
		options: command.options,
		defaultPermission: command.name === "verify" ? true : false,
	}));

	return commands
		.set(commandList)
		.then(slashCommands => {
			const permissionList = [
				...slashCommands.map((slashCommand, commandId) => {
					const permissions = getPermissions(slashCommand.name);
					permissions.perms[0].id = getPermField(permissions.field as keyof Config, config);
					return { id: commandId, permissions: permissions.perms };
				}),
			];
			commands.permissions.set({ fullPermissions: permissionList }).catch(err => log(err, "error"));
		})
		.catch(err => log(err, "error"));
}
