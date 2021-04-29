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
					`<@${message.author.id}>\nWebsocket heartbeat: ${
						state.discordClient.ws.ping
					}ms\nRoundtrip latency: ${sent.createdTimestamp - message.createdTimestamp}ms`
				);
			})
			.catch(console.error);
	},
};

export default command;
