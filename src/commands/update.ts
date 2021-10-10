import { SlashCommand, WrappedClient } from "pandawrapper";

export const updateSlashCommand = new SlashCommand("update", "Shutdown the bot in lieu of an update.");
updateSlashCommand.setCallback(() => {
	WrappedClient.getClient().destroy();
	process.exit();
});
