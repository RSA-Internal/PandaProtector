let oauth: string;

export function setOauth(token: string): void {
	oauth = token;
}

export function getOauth(): string | undefined {
	return oauth;
}
