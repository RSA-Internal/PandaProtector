import type { Command } from "../command";

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	hasPermission: () => true,
	parseArguments: () => [],
	handler: (state, message) => {
		message
			.reply("Pinging...")
			.then(sent =>
				sent.edit(
					`<@${message.author.id}>\nWebsocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip latency: ${
						sent.createdTimestamp - message.createdTimestamp
					}ms`
				)
			)
			.catch(console.error.bind(console));
	},
};

export default command;
