import type { TextChannel } from "discord.js";
import { getState } from "./store/state";

const verbosityLevels = ["none", "info", "warn", "error", "debug", "all"];

export const logLevels = {
	info: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
	debug: console.debug.bind(console),
};

export type LogLevel = keyof typeof logLevels;

export function log(message: string, level: LogLevel): void {
	logLevels[level](`[${level}]: ${message}`);

	const state = getState();
	const verbosityIdx = verbosityLevels.indexOf(state.config.verbosityLevel);
	const shouldLog = verbosityIdx >= verbosityLevels.indexOf(level);

	if (shouldLog) {
		const logChannel = state.client.channels.resolve(state.config.logChannelId) as TextChannel | undefined;

		if (logChannel) {
			logChannel.send(`[${level}]: ${message}`).catch(console.error.bind(console));
		}
	}
}

export function canUpdateVerbosity(verbosity: string): boolean {
	return verbosityLevels.includes(verbosity.toLowerCase());
}
