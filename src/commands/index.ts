import type { Command } from "../command";
import compile from "./compile";
import compilers from "./compilers";
import help from "./help";
import ping from "./ping";
import report from "./report";
import update from "./update";

/** Keep commands in lowercase. */
const commands = {
	compile,
	compilers,
	help,
	ping,
	report,
	update,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName.toLowerCase() as never];
}

export function getCommands(): Command[] {
	return Object.values(commands);
}
