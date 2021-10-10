export interface Config {
	guildId: string;
	memberRoleId: string;
	modRoleId: string;
	adminRoleId: string;
	showcaseChannelId: string;
	reportChannelId: string;
	botChannelId: string;
	staffCategoryId: string;
}

export function isConfig(config: unknown): config is Config {
	const record = config as { [index: string]: unknown };

	return (
		typeof config === "object" &&
		config !== null &&
		typeof record["guildId"] === "string" &&
		typeof record["memberRoleId"] === "string" &&
		typeof record["modRoleId"] === "string" &&
		typeof record["adminRoleId"] === "string" &&
		typeof record["showcaseChannelId"] === "string" &&
		typeof record["reportChannelId"] === "string" &&
		typeof record["botChannelId"] === "string" &&
		typeof record["staffCategoryId"] === "string"
	);
}
