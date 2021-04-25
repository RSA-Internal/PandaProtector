import type { Message } from "discord.js";
import type { State } from "./state";

export interface Command {
	readonly name: string;
	readonly description: string;
	readonly options: readonly CommandOption[];
	readonly hasPermission: (state: State, message: Message) => boolean;
	readonly parseArguments: (content: string) => string[];
	readonly handler: (state: State, message: Message, ...args: string[]) => void;
}

interface CommandOption {
	readonly name: string;
	readonly description: string;
	readonly optional?: true;
}
