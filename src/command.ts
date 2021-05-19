import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import type { State } from "./state";

export interface Command {
	readonly name: string;
	readonly description: string;
	readonly options: ApplicationCommandOptionData[];
	readonly hasPermission: (state: State, interaction: CommandInteraction) => boolean;
	readonly parseArguments: (content: string) => string[];
	readonly handler: (state: State, interaction: CommandInteraction, ...args: string[]) => void;
}
