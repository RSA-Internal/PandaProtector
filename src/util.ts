export function assert<T>(expr: T, message?: string): asserts expr {
	if (expr === null || expr === undefined) {
		throw new Error(message ?? "assertion failed!");
	}
}

export function randomMinMax(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}
