import type { Command } from "../command";
import cmdhistory from "./cmdHistory";
import help from "./help";
import ping from "./ping";
import report from "./report";
import update from "./update";

const commands = {
	help,
	ping,
	report,
	update,
	cmdhistory,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName.toLowerCase() as never];
}

export function getCommands(): Command[] {
	return Object.values(commands);
}
