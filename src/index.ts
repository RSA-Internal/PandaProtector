import exitHook from "async-exit-hook";
import { Client, Intents } from "discord.js";
import { readFileSync } from "fs";
import { connect, connection, disconnect } from "mongoose";
import { getEvents } from "./events";
import { canUpdateVerbosity, log } from "./logger";
import { setOauth } from "./store/githubOauth";
import { setState } from "./store/state";
import { isConfig } from "./structures/config";
import { isSecrets, Secrets } from "./structures/secrets";
import type { State } from "./types/state";

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

	getEvents().forEach(event => {
		log(`Loading event: ${event.name}.`, "debug");
		if (event.once) {
			log(`Loaded event: ${event.name} as once.`, "debug");
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			log(`Loaded event: ${event.name} as on.`, "debug");
			client.on(event.name, (...args) => event.execute(...args));
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

	exitHook(() => {
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
