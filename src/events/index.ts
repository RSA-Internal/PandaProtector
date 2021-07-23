import type { Event } from "../types/event";
import guildMemberAdd from "./guildMemberAdd";
import guildMemberUpdate from "./guildMemberUpdate";
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";
import ready from "./ready";

const events = {
	guildMemberAdd,
	guildMemberUpdate,
	interactionCreate,
	messageCreate,
	ready,
};

export function getEvent(eventName: string): Event | undefined {
	return events[eventName.toLowerCase() as never];
}

export function getEvents(): Event[] {
	return Object.values(events);
}
