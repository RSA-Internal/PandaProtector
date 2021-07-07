import type { Snowflake } from "discord-api-types";
import type { Client, Guild, Message, User } from "discord.js";
import { getCommands } from "./commands";
import { log } from "./logger";
import moderationActionLogModel from "./models/moderationActionLog.model";
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

export function getMessageFromId(messageId: Snowflake, guild: Guild): Message | undefined {
	if (messageId !== undefined && guild !== null) {
		for (const [, guildChannel] of guild.channels.cache) {
			if (guildChannel.isText()) {
				const msg = guildChannel.messages.cache.get(messageId);
				if (msg) return msg;
			}
		}
	}
	return undefined;
}

export function addModerationRecordWithMessageToDB(
	offender: Snowflake,
	moderator: Snowflake,
	reason: string,
	messageId: Snowflake,
	actionLevel: number
): void {
	moderationActionLogModel
		.count({}, undefined)
		.catch(err => {
			console.error(err);
			setTimeout(() => {
				addModerationRecordWithMessageToDB(offender, moderator, reason, messageId, actionLevel);
			}, 120000);
		})
		.then(countedCaseNo =>
			moderationActionLogModel
				.create({
					caseNumber: countedCaseNo,
					offenderId: offender,
					moderatorId: moderator,
					actionLevel: actionLevel,
					reason: reason,
					messageId: messageId,
				})
				.catch(err => {
					console.error(err);
					setTimeout(() => {
						addModerationRecordWithMessageToDB(offender, moderator, reason, messageId, actionLevel);
					}, 120000);
				})
		);
}

export function addModerationRecordToDB(
	offender: Snowflake,
	moderator: Snowflake,
	reason: string,
	actionLevel: number
): void {
	moderationActionLogModel
		.count({}, undefined)
		.catch(err => {
			console.error(err);
			setTimeout(() => {
				addModerationRecordToDB(offender, moderator, reason, actionLevel);
			}, 120000);
		})
		.then(countedCaseNo =>
			moderationActionLogModel
				.create({
					caseNumber: countedCaseNo,
					offenderId: offender,
					moderatorId: moderator,
					actionLevel: actionLevel,
					reason: reason,
				})
				.catch(err => {
					console.error(err);
					setTimeout(() => {
						addModerationRecordToDB(offender, moderator, reason, actionLevel);
					}, 120000);
				})
		);
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
		defaultPermission: false,
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
