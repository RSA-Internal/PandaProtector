export interface Secrets {
	readonly token: string;
}

export function isSecrets(secrets: unknown): secrets is Secrets {
	const record = secrets as { [index: string]: unknown };

	return typeof secrets === "object" && secrets !== null && typeof record["token"] === "string";
}
