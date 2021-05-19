export interface Config {
	commandPrefix: string;
	guildId: string;
	memberRoleId: string;
	staffRoleId: string;
	developerRoleId: string;
	showcaseChannelId: string;
	reportChannelId: string;
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
