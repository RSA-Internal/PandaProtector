import type { TextChannel } from "discord.js";
import type { State } from "./state";

let state: State;
let verbosityLevel = "none";
const verbosityLevels = ["none", "info", "warn", "error", "debug", "all"];

export function updateVerbosity(newVerbosity: string): boolean {
	if (verbosityLevels.includes(newVerbosity.toLowerCase())) {
		verbosityLevel = newVerbosity.toLowerCase();
		return true;
	} else {
		log(`Attempted to assign an invalid verbosity level: ${newVerbosity}`, logLevels.warn);
		return false;
	}
}

export function initLogger(initState: State, initVerbosityLevel: string): void {
	state = initState;
	if (verbosityLevels.includes(initVerbosityLevel.toLowerCase())) {
		verbosityLevel = initVerbosityLevel.toLowerCase();
	} else {
		log(`Invalid debugMode loaded from config: ${initVerbosityLevel}`, logLevels.warn);
		verbosityLevel = "info";
	}

	log(`Verbosity Level: ${verbosityLevel}`, logLevels.debug);
	log("Logger initialized.", logLevels.info);
}

export interface LogLevel {
	level: string;
	binding: (this: unknown, ...args: unknown[]) => void;
}

export const logLevels = {
	info: { level: "INFO", binding: console.log.bind(console) },
	warn: { level: "WARN", binding: console.warn.bind(console) },
	error: { level: "ERROR", binding: console.error.bind(console) },
	debug: { level: "DEBUG", binding: console.debug.bind(console) },
};

export function log(message: string, logLevel: LogLevel): void {
	logLevel.binding(`[${logLevel.level}]: ${message}`);

	const shouldLog = verbosityLevels.indexOf(logLevel.level.toLowerCase()) <= verbosityLevels.indexOf(verbosityLevel);

	if (state && shouldLog) {
		const logChannel = state.client.channels.resolve(state.config.logChannelId) as TextChannel;

		if (logChannel) {
			logChannel.send(`[${logLevel.level}]: ${message}`).catch(err => log(err, logLevels.error));
		}
	}
}
