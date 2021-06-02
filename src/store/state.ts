import type { State } from "../state";
import { assert } from "../util";

let state: State | undefined;

export function setState(newState: State): void {
	state = newState;
}

export function getState(): State {
	assert(state, "State not set!");
	return state;
}
