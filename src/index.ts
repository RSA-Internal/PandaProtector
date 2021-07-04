import { Client, Intents } from "discord.js";
import exitHook from "exit-hook";
import { readFileSync } from "fs";
import { connect, connection, disconnect } from "mongoose";
import { getCommand, getCommands } from "./commands";
import { Config, isConfig } from "./config";
import { canUpdateVerbosity, log } from "./logger";
import commandLogModel from "./models/commandLog.model";
import { isSecrets, Secrets } from "./secrets";
import type { State } from "./state";
import { setOauth } from "./store/githubOauth";
import { getPermissions, setPermState } from "./store/permissions";
import { setState } from "./store/state";
import { getMemberCommands } from "./util";

// USAGE: npm start [configPath] [secretsPath]
const configPath = process.argv[2] ?? "config.json";
const secretsPath = process.argv[3] ?? "secrets.json";

function getPermField(idField: string, config: Config): `${bigint}` {
	let newId: `${bigint}` = "0";

	if (idField === "memberRoleId") newId = config.memberRoleId;
	if (idField === "staffRoleId") newId = config.staffRoleId;
	if (idField === "developerRoleId") newId = config.developerRoleId;

	return newId;
}

function deploySlashCommands(client: Client, config: Config) {
	log("Deploying slash commands", "info");
	const commands = client.guilds.cache.get(config.guildId)?.commands;

	if (!commands) {
		log('Could not deploy slash-commands. Can retry with "!deploy".', "warn");
		return Promise.reject("Could not deploy slash-commands.");
	}

	return Promise.all(
		getCommands().map(command => {
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
						if (perms[0].id === "0") {
							perms[0].id = getPermField(permissions.field, config) as `${bigint}`;
						}
						slash.setPermissions(permissions.perms).catch(err => log(err as string, "warn"));
						finalPermId = perms[0].id;
					}

					log(`Loaded ${slash.name} with id: ${slash.id} [PermissionsID: ${finalPermId}].`, "debug");
				})
				.catch(err => log(err, "error"));
		})
	);
}

function main(state: State, secrets: Secrets) {
	const { config, client } = state;

	setState(state);
	setPermState(state);

	if (!canUpdateVerbosity(config.verbosityLevel)) {
		// TODO: a more scalable approach to sanity checking config.
		config.verbosityLevel = "all";
		log("Invalid verbosity level, using all instead.", "warn");
	}

	client.on("ready", () => {
		client.user?.setActivity(state.version, { type: "PLAYING" });
		log("Client logged in.", "info");
		log(`Client Version: ${state.version}`, "debug");
		deploySlashCommands(client, config).catch(console.error.bind(console));
	});

	client.on("interaction", interaction => {
		if (!interaction.isCommand()) return;
		const command = getCommand(interaction.commandName);

		const memberCommands = getMemberCommands(interaction.member);

		if (command && memberCommands.includes(command)) {
			commandLogModel
				.create({
					discordId: interaction.user.id,
					command: command.name,
					arguments: interaction.options.map(value => String(value.value)),
				})
				.catch(console.error.bind(console));

			command.handler(interaction, interaction.options);
		}
	});

	client.on("message", message => {
		if (message.author.bot) {
			// Do not process bot messages.
			return;
		}

		if (message.channel.id === config.showcaseChannelId) {
			// Handle showcase.
			if (message.attachments.size === 0 && !/https?:\/\//.test(message.content)) {
				// Ensure messages in showcase contain an attachment or link.
				if (!message.member?.roles.cache.has(config.staffRoleId)) {
					message.delete().catch(console.error.bind(console));
					return; // Do not do any further processing.
				}
			} else {
				// Add up vote and down vote reaction to message.
				// TODO: make emotes configurable in the future?
				message.react("👍").catch(console.error.bind(console));
				message.react("👎").catch(console.error.bind(console));
			}
		}

		// Handle meta commands.
		if (message.member?.roles.cache.has(state.config.developerRoleId)) {
			if (message.content.toLowerCase() === "!deploy") {
				deploySlashCommands(client, config)
					.then(() => message.reply("Successfully loaded slash-commands."))
					.catch(console.error.bind(console));
			} else if (message.content.toLowerCase() === "!unload") {
				client.guilds.cache
					.get(config.guildId)
					?.commands.set([])
					.then(() => message.reply("Successfully unloaded slash-commands."))
					.catch(console.error.bind(console));
			} else if (message.content.toLowerCase() === "!unload-global") {
				client.application?.commands
					.set([])
					.then(() =>
						message.reply(
							"Global slash-commands successfully unloaded. Please give approx 1 hour for changes to take effect."
						)
					)
					.catch(console.error.bind(console));
			}
		}
	});

	client.on("guildMemberUpdate", (oldMember, newMember) => {
		if (oldMember.pending) {
			newMember.roles.add(config.memberRoleId).catch(console.error.bind(console));
		}

		if (JSON.parse(config.removeMemberRoleOnMute)) {
			if (newMember.roles.cache.has(config.mutedRoleId as `${bigint}`)) {
				newMember.roles.remove(config.memberRoleId).catch(err => log(err, "error"));
			} else if (!newMember.roles.cache.has(config.mutedRoleId as `${bigint}`)) {
				newMember.roles.add(config.memberRoleId).catch(err => log(err, "error"));
			}
		}
	});

	// Connect to the database.
	connect(secrets.dbUri, {
		ssl: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).catch(reason => log(`Could not connect to the database: ${String(reason)}`, "error"));

	connection.on("error", reason => {
		log(String(reason), "error");
	});

	// Cleanup resources on exit.
	exitHook(() => {
		client.guilds.cache.get(config.guildId)?.commands.set([]).catch(console.error.bind(console));
		disconnect().catch(console.error.bind(console));
	});
}

try {
	const config = JSON.parse(readFileSync(configPath, "utf-8")) as unknown;
	const secrets = JSON.parse(readFileSync(secretsPath, "utf-8")) as unknown;
	const version = (JSON.parse(readFileSync("package.json", "utf-8")) as { version: string })["version"];

	if (!isConfig(config)) {
		// Potentially replace missing fields with defaults instead of erroring out?
		throw new Error("Config file does not match the Config interface.");
	}

	if (!isSecrets(secrets)) {
		throw new Error("Secrets file does not match the Secrets interface.");
	}

	const client = new Client({
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
	});

	if (secrets.ghOauth !== "") {
		setOauth(secrets.ghOauth);
	}

	// Connect to Discord.
	client
		.login(secrets.token)
		.then(() => main({ version, config, client, configPath }, secrets))
		.catch(console.error.bind(console));
} catch (e) {
	console.error(e);
}
