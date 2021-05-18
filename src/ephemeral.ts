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
			setTimeout(function () {
				sent.delete().then(console.log.bind(console)).catch(console.error.bind(console));
			}, timeout);
			return sent;
		} else {
			return sent;
		}
	});
}
