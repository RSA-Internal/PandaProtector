import type { Message } from "discord.js";
import type { State } from "./state";

export async function ephemeral(
	state: State,
	message: Promise<Message>,
	timeout = 5000,
	shouldBeEphemeral?: (state: State, message: Message) => boolean
): Promise<Message> {
	return message.then(sent => {
		if (!shouldBeEphemeral || shouldBeEphemeral(state, sent)) {
			return sent.delete({ timeout });
		} else {
			return sent;
		}
	});
}
