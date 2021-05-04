import type { Command } from "../command";
import compile from "./compile";
import help from "./help";
import ping from "./ping";
import report from "./report";
import update from "./update";

const commands = {
	compile,
	help,
	ping,
	report,
	update,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName as never];
}

export function getCommands(): Command[] {
	return Object.values(commands);
}
