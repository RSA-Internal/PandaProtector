import type { Client } from "discord.js";
import type { Config } from "./config";

export interface State {
	readonly version: string;
	readonly config: Config;
	readonly discordClient: Client;
}
