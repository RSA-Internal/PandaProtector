import type { CommandInteraction, TextChannel } from "discord.js";
import type { State } from "./state";

let debugMode = 0;

export function initLogger(initDebugMode: string): void {
	let parsedDebugMode = parseInt(initDebugMode);
	if (isNaN(parsedDebugMode)) {
		parsedDebugMode = 0;
		log(`Invalid debug mode provided: ${initDebugMode}.`, logLevels.warn);
	}
	debugMode = parsedDebugMode;
	log(`DebugMode: ${debugMode}`, logLevels.debug);
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

export function log(
	message: string,
	logLevel: LogLevel,
	state?: State,
	interaction?: CommandInteraction,
	display?: boolean
): void {
	if (logLevel === logLevels.debug && debugMode !== 1 && !display) {
		return;
	}
	logLevel.binding(`[${logLevel.level}]: ${message}`);

	if (interaction && (debugMode === 1 || display)) {
		const debugChannel = (state ? state.config.debugChannelId : interaction.channelID) as string;

		(interaction.guild?.channels.resolve(debugChannel) as TextChannel)
			.send(`[${logLevel.level}]: ${message}`)
			.catch(err => log(err, logLevels.error));
	}
}
