import { Client, Intents } from "discord.js";
import { parse } from "dotenv";
import exitHook from "exit-hook";
import { readFileSync } from "fs";
import { connect, connection, disconnect } from "mongoose";
import { getCommand, getCommands } from "./commands";
import { Config, isConfig } from "./config";
import { DotEnv, isDotEnv } from "./dotEnv";
import type { State } from "./state";
import { setOauth } from "./store/githubOauth";

// USAGE: npm start [configPath] [envPath]
const configPath = process.argv[2] ?? "config.json";
const envPath = process.argv[3] ?? ".env";

function deploySlashCommands(client: Client, config: Config) {
	return Promise.all(
		getCommands().map(command =>
			client.guilds.cache.get(config.guildId)?.commands.create({
				name: command.name,
				description: command.description,
				options: command.options,
			})
		)
	);
}

function main(state: State, env: DotEnv) {
	const { config, client } = state;

	client.on("ready", () => {
		client.user?.setActivity(state.version, { type: "PLAYING" });
		deploySlashCommands(client, config).catch(console.error.bind(console));
	});

	client.on("interaction", interaction => {
		if (!interaction.isCommand()) return;
		const command = getCommand(interaction.commandName);

		if (command && command.hasPermission(state, interaction)) {
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
	connect(env.dbUri, {
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
	const version = (JSON.parse(readFileSync("package.json", "utf-8")) as { version: string })["version"];

	if (!isConfig(config)) {
		throw new Error("Config file does not match the Config interface.");
	}

	const env = parse(readFileSync(envPath, "utf-8"));

	if (!isDotEnv(env)) {
		throw new Error("Environment file does not match the DotEnv interface.");
	}

	const client = new Client({
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
	});

	if (env.ghOauth) {
		setOauth(env.ghOauth);
	}

	// Connect to Discord.
	client
		.login(env.token)
		.then(() => main({ version, config, client, configPath }, env))
		.catch(console.error.bind(console));
} catch (e) {
	console.error(e);
}
