import type { Command } from "../command";
import cmdhistory from "./cmdhistory";
import compile from "./compile";
import compilers from "./compilers";
import config from "./config";
import github from "./github";
import help from "./help";
import ping from "./ping";
import report from "./report";
import update from "./update";
import uptime from "./uptime";

/** Keep commands in lowercase. */
const commands = {
	cmdhistory,
	compile,
	compilers,
	config,
	github,
	help,
	ping,
	report,
	update,
	uptime,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName.toLowerCase() as never];
}

export function getCommands(): Command[] {
	// TODO: return a readonly Command[] and cache it?
	return Object.values(commands);
}
