import type { ApplicationCommandOptionData, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

export interface Command {
	readonly name: string;
	readonly description: string;
	readonly options: ApplicationCommandOptionData[];
	readonly shouldBeEphemeral: (interaction: CommandInteraction) => boolean;
	readonly handler: (interaction: CommandInteraction, args: CommandInteractionOptionResolver) => void;
}
