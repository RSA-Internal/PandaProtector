import type { Client } from "discord.js";
import type { Config } from "../structures/config";

export interface State {
	readonly version: string;
	readonly config: Config;
	readonly client: Client;
	readonly configPath: string;
}
