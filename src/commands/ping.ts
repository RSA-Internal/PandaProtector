import { SlashCommand, WrappedClient } from "pandawrapper";

export const pingSlashCommand = new SlashCommand("ping", "Show bot latency information.");
pingSlashCommand.setCallback(async interaction => {
	const start = Date.now();

	await interaction
		.reply("Pinging...")
		.then(() =>
			interaction.editReply(
				`Websocket heartbeat: ${WrappedClient.getClient().ws.ping}ms\nRoundtrip latency: ${
					Date.now() - start
				}ms`
			)
		);
});
