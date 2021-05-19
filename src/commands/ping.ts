import { promisify } from "util";
import type { Command } from "../command";

const wait = promisify(setTimeout);

const command: Command = {
	name: "ping",
	description: "Show bot latency information.",
	options: [],
	hasPermission: () => true,
	parseArguments: () => [],
	handler: async (state, interaction) => {
		await interaction.reply("Pinging...");
		await wait(2000);
		await interaction.editReply(
			`Websocket heartbeat: ${state.client.ws.ping}ms\nRoundtrip latency: ${
				Date.now() - interaction.createdTimestamp
			}ms`
		);
	},
};

export default command;
