export interface Config {
	readonly commandPrefix: string;
	readonly guildId: string;
	readonly memberRoleId: string;
	readonly staffRoleId: string;
	readonly developerRoleId: string;
	readonly showcaseChannelId: string;
	readonly reportChannelId: string;
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
