import type { Command } from "../command";
import echo from "./echo";
import help from "./help";
import ping from "./ping";
import report from "./report";

const commands = {
	echo,
	help,
	ping,
	report,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName as never];
}

export function getCommands(): Command[] {
	return Object.values(commands);
}
