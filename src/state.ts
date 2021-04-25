import { Client } from "discord.js";

export interface State {
	readonly client: Client;
	readonly applicationId: string;
	readonly publicKey: string;
	readonly token: string;
	readonly commandPrefix: string;
	readonly guildId: string;
	readonly memberRoleId: string;
	readonly staffRoleId: string;
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
		typeof record["applicationId"] === "string" &&
		typeof record["publicKey"] === "string" &&
		typeof record["token"] === "string" &&
		typeof record["commandPrefix"] === "string" &&
		typeof record["guildId"] === "string" &&
		typeof record["memberRoleId"] === "string" &&
		typeof record["staffRoleId"] === "string" &&
		typeof record["showcaseChannelId"] === "string" &&
		typeof record["reportChannelId"] === "string"
	);
}
