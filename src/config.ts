export interface Config {
	guildId: string;
	memberRoleId: string;
	staffRoleId: string;
	developerRoleId: string;
	showcaseChannelId: string;
	reportChannelId: string;
	botChannelId: string;
	staffCategoryId: string;
	ghRepoPath: string;
	verbosityLevel: string;
	logChannelId: string;
}

export function isConfig(config: unknown): config is Config {
	const record = config as { [index: string]: unknown };

	return (
		typeof config === "object" &&
		config !== null &&
		typeof record["guildId"] === "string" &&
		typeof record["memberRoleId"] === "string" &&
		typeof record["staffRoleId"] === "string" &&
		typeof record["developerRoleId"] === "string" &&
		typeof record["showcaseChannelId"] === "string" &&
		typeof record["reportChannelId"] === "string" &&
		typeof record["botChannelId"] === "string" &&
		typeof record["staffCategoryId"] === "string" &&
		typeof record["ghRepoPath"] === "string" &&
		typeof record["verbosityLevel"] === "string" &&
		typeof record["logChannelId"] === "string"
	);
}
