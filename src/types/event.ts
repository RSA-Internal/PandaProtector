import type { Client, GuildMember, Interaction, Message, PartialGuildMember } from "discord.js";

export interface EventArgs {
	client?: Client;
	CommandInteraction?: Interaction;
	message?: Message;
	oldMember?: GuildMember | PartialGuildMember;
	newMember?: GuildMember;
}

export interface Event {
	readonly name: string;
	readonly once?: boolean;
	readonly execute: ([...args]?) => void;
}
