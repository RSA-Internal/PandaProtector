import type { Client as DiscordClient } from "discord.js";
import type { MongoClient } from "mongodb";
import type { Config } from "./config";

export interface State {
	readonly version: string;
	readonly config: Config;
	readonly discordClient: DiscordClient;
	readonly mongoClient: MongoClient;
}
