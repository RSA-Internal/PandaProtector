import exitHook from "async-exit-hook";
import { Client, Intents } from "discord.js";
import { readFileSync } from "fs";
import { connect, connection, disconnect } from "mongoose";
import { getCommand } from "./commands";
import { isConfig } from "./config";
import { canUpdateVerbosity, log } from "./logger";
import commandLogModel from "./models/commandLog.model";
import { isSecrets, Secrets } from "./secrets";
import type { State } from "./state";
import { setOauth } from "./store/githubOauth";
import { setState } from "./store/state";
import { deploySlashCommands } from "./util";

// USAGE: npm start [configPath] [secretsPath]
const configPath = process.argv[2] ?? "config.json";
const secretsPath = process.argv[3] ?? "secrets.json";

function main(state: State, secrets: Secrets) {
	const { config, client } = state;

	setState(state);

	if (!canUpdateVerbosity(config.verbosityLevel)) {
		// TODO: a more scalable approach to sanity checking config.
		config.verbosityLevel = "all";
		log("Invalid verbosity level, using all instead.", "warn");
	}

	client.on("ready", () => {
		client.user?.setActivity(state.version, { type: "PLAYING" });
		log("Client logged in.", "info");
		log(`Client Version: ${state.version}`, "debug");
		deploySlashCommands()
			.then(() => log("Loaded slash commands.", "info"))
			.catch(err => log(err, "error"));
	});

	client.on("interactionCreate", interaction => {
		if (!interaction.isCommand()) return;
		const command = getCommand(interaction.commandName);
		if (command) {
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

	client.on("messageCreate", message => {
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
				deploySlashCommands()
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

	exitHook(callback => {
		client.guilds.cache
			.get(config.guildId)
			?.commands.set([])
			.then(callback)
			.catch(err => {
				log(err, "error");
				callback();
			});
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
