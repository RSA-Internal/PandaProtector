export interface DotEnv {
	readonly token: string;
	readonly dbUri: string;
	readonly ghOauth: string;
}

export function isDotEnv(env: unknown): env is DotEnv {
	const record = env as { [index: string]: unknown };

	return (
		typeof env === "object" &&
		env !== null &&
		typeof record["token"] === "string" &&
		typeof record["dbUri"] === "string" &&
		typeof record["ghOauth"] === "string"
	);
}
