import type { Command } from "../command";
import echo from "./echo";
import ping from "./ping";
import report from "./report";

const commands = {
	echo,
	ping,
	report,
};

export function getCommand(commandName: string): Command | undefined {
	return commands[commandName as never];
}
