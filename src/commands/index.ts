import type { Command } from "../command";
import compile from "./compile";
import compilers from "./compilers";
import config from "./config";
import help from "./help";
import ping from "./ping";
import report from "./report";
import update from "./update";
import uptime from "./uptime";

/** Keep commands in lowercase. */
const commands = {
	compile,
	compilers,
	config,
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
	return Object.values(commands);
}
