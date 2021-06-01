import type { ApplicationCommand, CommandInteraction } from "discord.js";

// TODO: remove when Discord.js decides to actually expose these types...
type ApplicationCommandOptionData = Parameters<typeof ApplicationCommand["transformOption"]>[0];

export interface Command {
	readonly name: string;
	readonly description: string;
	readonly options: ApplicationCommandOptionData[];
	readonly hasPermission: (interaction: CommandInteraction) => boolean;
	readonly shouldBeEphemeral: (interaction: CommandInteraction) => boolean;
	readonly handler: (interaction: CommandInteraction, args: CommandInteraction["options"]) => void;
}
