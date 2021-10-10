import { readFileSync } from "fs";
import { WrappedClient } from "pandawrapper";
import { configSlashCommand } from "./commands/config";
import { pingSlashCommand } from "./commands/ping";
import { reportSlashCommand } from "./commands/report";
import { serverInfoMessageCommand, serverInfoSlashCommand } from "./commands/serverinfo";
import { updateSlashCommand } from "./commands/update";
import { uptimeMessageCommand, uptimeSlashCommand } from "./commands/uptime";
import { messageCreateEvent } from "./events/messageCreate";
import { setState } from "./store/state";
import { isConfig } from "./structures/config";
import { isSecrets } from "./structures/secrets";

// USAGE: npm start [configPath] [secretsPath]
const configPath = process.argv[2] ?? "config.json";
const secretsPath = process.argv[3] ?? "secrets.json";

try {
	const config = JSON.parse(readFileSync(configPath, "utf-8")) as unknown;
	const secrets = JSON.parse(readFileSync(secretsPath, "utf-8")) as unknown;
	const version = (JSON.parse(readFileSync("package.json", "utf-8")) as { version: string })["version"];

	if (!isConfig(config)) {
		// Potentially replace missing fields with defaults instead of erroring out?
		throw new Error("Config file does not match the Config interface.");
	}

	if (!isSecrets(secrets)) {
		throw new Error("Secrets file does not match the Secrets interface.");
	}

	const client = new WrappedClient("pp!");

	setState({ version, config, configPath });

	// Register Events
	client.registerEvent(messageCreateEvent);

	// Apply permissions
	configSlashCommand.addPermission(config.modRoleId, "ROLE", true);
	configSlashCommand.addPermission(config.adminRoleId, "ROLE", true);
	pingSlashCommand.addPermission(config.memberRoleId, "ROLE", true);
	reportSlashCommand.addPermission(config.memberRoleId, "ROLE", true);
	serverInfoSlashCommand.addPermission(config.memberRoleId, "ROLE", true);
	serverInfoMessageCommand.addAllowed(config.memberRoleId);
	updateSlashCommand.addPermission(config.adminRoleId, "ROLE", true);
	uptimeSlashCommand.addPermission(config.memberRoleId, "ROLE", true);
	uptimeMessageCommand.addAllowed(config.memberRoleId);

	// Register Commands
	client.registerCommandObject(configSlashCommand);
	client.registerCommandObject(pingSlashCommand);
	client.registerCommandObject(reportSlashCommand);
	client.registerCommandObject(serverInfoSlashCommand);
	client.registerCommandObject(updateSlashCommand);
	client.registerCommandObject(uptimeSlashCommand);

	client.registerMessageCommand(serverInfoMessageCommand);
	client.registerMessageCommand(uptimeMessageCommand);

	// Connect to Discord.
	client
		.login(secrets.token)
		.then(() => WrappedClient.getClient().user?.setActivity(version))
		.catch(console.error.bind(console));
} catch (e) {
	console.error(e);
}
