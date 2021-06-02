import type { ApplicationCommandOptionData, CommandInteraction, CommandInteractionOption } from "discord.js";

export interface Command {
	readonly name: string;
	readonly description: string;
	readonly options: ApplicationCommandOptionData[];
	readonly hasPermission: (interaction: CommandInteraction) => boolean;
	readonly shouldBeEphemeral: (interaction: CommandInteraction) => boolean;
	readonly handler: (interaction: CommandInteraction, args: CommandInteractionOption[]) => void;
}
