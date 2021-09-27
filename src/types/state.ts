import type { Config } from "../structures/config";

export interface State {
	readonly version: string;
	readonly config: Config;
	readonly configPath: string;
}
