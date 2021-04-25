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
			.then(sent => {
				void sent.edit(
					`<@${message.author.id}>\nWebsocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip Latency: ${
						sent.createdTimestamp - message.createdTimestamp
					}ms`
				);
			})
			.catch(reason => console.error(reason));
	},
};

export default command;
