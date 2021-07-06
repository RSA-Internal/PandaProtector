import type { Snowflake } from "discord-api-types";
import type { Client, User } from "discord.js";
import { getCommands } from "./commands";
import type { Config } from "./config";
import { log } from "./logger";
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

function getPermField(idField: keyof Config, config: Config): `${bigint}` {
	return config[idField] as `${bigint}`;
}

export async function deploySlashCommands(): Promise<void[]> {
	const { client, config } = getState();

	log("Deploying slash commands", "debug");
	const commands = client.guilds.cache.get(config.guildId)?.commands;

	if (!commands) {
		log('Could not deploy slash-commands. Can retry with "!deploy".', "warn");
		return Promise.reject("Could not deploy slash-commands.");
	}

	const cachedCommands = (await commands.fetch()).map(command => command.name);

	return Promise.all(
		getCommands()
			.filter(command => !cachedCommands.includes(command.name))
			.map(command => {
				commands
					.create({
						name: command.name,
						description: command.description,
						options: command.options,
						defaultPermission: false,
					})
					.then(slash => {
						const permissions = getPermissions(command.name);
						let finalPermId = "0";

						if (permissions) {
							const perms = permissions.perms;
							perms[0].id = getPermField(permissions.field as keyof Config, config);
							slash.manager.permissions
								.add({
									command: slash,
									guild: config.guildId,
									permissions: permissions.perms,
								})
								.catch(err => log(err, "warn"));
							finalPermId = perms[0].id;
						}

						log(`Loaded ${slash.name} with id: ${slash.id} [PermissionsID: ${finalPermId}].`, "debug");
					})
					.catch(err => log(err, "error"));
			})
	);
}
