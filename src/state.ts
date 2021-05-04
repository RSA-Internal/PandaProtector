import { Client } from "discord.js";

export interface State {
	readonly client: Client;
	readonly commandPrefix: string;
	readonly guildId: string;
	readonly memberRoleId: string;
	readonly staffRoleId: string;
	readonly developerRoleId: string;
	readonly showcaseChannelId: string;
	readonly reportChannelId: string;
}

export type Config = Omit<State, "client">;

export function createState(config: Config): State {
	return {
		client: new Client(),
		...config,
	};
}

export function isConfig(config: unknown): config is Config {
	const record = config as { [index: string]: unknown };

	return (
		typeof config === "object" &&
		config !== null &&
		typeof record["commandPrefix"] === "string" &&
		typeof record["guildId"] === "string" &&
		typeof record["memberRoleId"] === "string" &&
		typeof record["staffRoleId"] === "string" &&
		typeof record["developerRoleId"] === "string" &&
		typeof record["showcaseChannelId"] === "string" &&
		typeof record["reportChannelId"] === "string"
	);
}
