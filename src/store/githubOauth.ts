import { assert } from "../util";

let oauth: string | undefined;

export function setOauth(token: string): void {
	oauth = token;
}

export function getOauth(): string {
	assert(oauth, "githubOauth not set!");
	return oauth;
}
