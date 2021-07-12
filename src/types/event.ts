import type { Client } from "discord.js";

const eventList = [
	"applicationCommandCreate",
	"applicationCommandDelete",
	"applicationCommandUpdate",
	"channelCreate",
	"channelDelete",
	"channelPinsUpdate",
	"channelUpdate",
	"debug",
	"emojiCreate",
	"emojiDelete",
	"emojiUpdate",
	"error",
	"guildBanAdd",
	"guildBanRemove",
	"guildCreate",
	"guildDelete",
	"guildIntegrationsUpdate",
	"guildMemberAdd",
	"guildMemberAvailable",
	"guildMemberRemove",
	"guildMembersChunk",
	"guildMemberUpdate",
	"guildUnavailable",
	"guildUpdate",
	"-interaction", //deprecated
	"interactionCreate",
	"invalidated",
	"invalidRequestWarning",
	"inviteCreate",
	"inviteDelete",
	"-message", //deprecated
	"messageCreate",
	"messageDelete",
	"messageDeleteBulk",
	"messageReactionAdd",
	"messageReactionRemove",
	"messageReactionRemoveAll",
	"messageReactionRemoveEmoji",
	"messageUpdate",
	"presenceUpdate",
	"rateLimit",
	"ready",
	"roleCreate",
	"roleDelete",
	"roleUpdate",
	"shardDisconnect",
	"shardError",
	"shardReady",
	"shardReconnecting",
	"shardResume",
	"stageInstanceCreate",
	"stageInstanceDelete",
	"stageInstanceUpdate",
	"threadCreate",
	"threadDelete",
	"threadListSync",
	"threadMembersUpdate",
	"threadMemberUpdate",
	"threadUpdate",
	"typingStart",
	"userUpdate",
	"voiceStateUpdate",
	"warn",
	"webhookUpdate",
];

interface Event {
	connectionName: string;
	callback: (...args: unknown[]) => void;
}

interface EventBus {
	name: string;
	hooks: Event[];
}

const eventBus = [] as EventBus[];

function reloadEventConnection(client: Client, eventName: string): void {
	console.log(`Reloading ${eventName}.`);
	const bus = eventBus.find(loadedEvent => loadedEvent.name === eventName);

	if (!bus) {
		console.error(`Failed to reload ${eventName}.`);
		return;
	}

	bus.hooks.forEach(event => {
		client.off(eventName, event.callback);
		client.on(eventName, event.callback);
		console.log(`Reloaded ${eventName}|${event.connectionName}.`);
	});
}

export function registerEvent(client: Client, eventName: string, event: Event): void {
	console.log(`Registering event: ${eventName}|${event.connectionName}`);
	let forceLoad = false;

	if (eventList.includes(`-${eventName}`)) {
		console.warn(`${eventName} is deprecated. Please consider using '${eventName}Create' instead.`);
		forceLoad = true;
	}

	if (!eventList.includes(eventName) && !forceLoad) {
		console.log(`Invalid event name: ${eventName}.`);
	} else {
		const bus = eventBus.find(loadedEvent => loadedEvent.name === eventName);

		const hooks = bus?.hooks ?? ([] as Event[]);

		hooks.push(event);
		console.log(`Loaded ${event.connectionName} into hooks for ${eventName}.`);

		eventBus.push({
			name: eventName,
			hooks: hooks,
		});

		reloadEventConnection(client, eventName);
	}
}

export function unregisterEvent(client: Client, eventName: string, connectionName: string): void {
	console.log(`Unregistering event: ${eventName}|${connectionName}.`);

	const busEvent = eventBus.find(loadedEvent => loadedEvent.name === eventName);

	if (!busEvent) {
		console.warn(`No loaded connections for ${eventName}.`);
		return;
	}

	const event = busEvent.hooks.find(hook => hook.connectionName === connectionName);

	if (!event) {
		console.warn(`No event to unload with connection name: ${connectionName}.`);
		return;
	}

	busEvent.hooks = busEvent.hooks.filter(hook => hook.connectionName != connectionName);

	client.off(eventName, event.callback);
}
