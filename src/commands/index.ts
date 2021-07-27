import type { Command } from "../types/command";
import config from "./config";
import ping from "./ping";
import question from "./question";

/** Keep commands in lowercase. */
const commands = {
	// cmdhistory,
	// compile,
	// compilers,
	config,
	// debug,
	// github,
	// permissions,
	ping,
	question,
	// report,
	// serverinfo,
	// update,
	// uptime,
	// verify,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName.toLowerCase() as never];
}

export function getCommands(): Command[] {
	// TODO: return a readonly Command[] and cache it?
	return Object.values(commands);
}
