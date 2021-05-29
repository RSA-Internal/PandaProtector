import { Client, Intents } from "discord.js";
import exitHook from "exit-hook";
import { readFileSync } from "fs";
import { connect, connection, disconnect } from "mongoose";
import { getCommand, getCommands } from "./commands";
import { Config, isConfig } from "./config";
import commandLogModel from "./models/commandLog.model";
import { isSecrets, Secrets } from "./secrets";
import type { State } from "./state";
import { setOauth } from "./store/githubOauth";

// USAGE: npm start [configPath] [secretsPath]
const configPath = process.argv[2] ?? "config.json";
const secretsPath = process.argv[3] ?? "secrets.json";

function deploySlashCommands(client: Client, config: Config) {
	const commands = client.guilds.cache.get(config.guildId)?.commands;

	if (!commands) {
		return Promise.reject("Could not deploy slash-commands.");
	}

	return Promise.all(
		getCommands().map(command =>
			commands.create({
				name: command.name,
				description: command.description,
				options: command.options,
			})
		)
	);
}

function main(state: State, secrets: Secrets) {
	const { config, client } = state;

	client.on("ready", () => {
		client.user?.setActivity(state.version, { type: "PLAYING" });
		deploySlashCommands(client, config).catch(console.error.bind(console));
	});

	client.on("interaction", interaction => {
		if (!interaction.isCommand()) return;
		const command = getCommand(interaction.commandName);

		if (command && command.hasPermission(state, interaction)) {
			commandLogModel
				.create({
					discordId: interaction.user.id,
					command: command.name,
					arguments: interaction.options.map(value => String(value.value)),
				})
				.catch(console.error.bind(console));

			command.handler(state, interaction, interaction.options);
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

	client.on("guildMemberUpdate", member => {
		if (member.pending) {
			member.roles.add(config.memberRoleId).catch(console.error.bind(console));
		}
	});

	const logError = async (message: string) => {
		const reportChannel = client.guilds.cache.get(config.guildId)?.channels.cache.get(config.reportChannelId);
		console.error(message);

		if (reportChannel?.isText()) {
			return reportChannel.send(message);
		}
	};

	// Connect to the database.
	connect(secrets.dbUri, {
		ssl: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).catch(reason => logError(`Could not connect to the database: ${String(reason)}`));

	connection.on("error", reason => {
		logError(String(reason)).catch(console.error.bind(console));
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
