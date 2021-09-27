import { readFileSync } from "fs";
import { WrappedClient } from "pandawrapper";
import { configSlashCommand } from "./commands/config";
import { pingSlashCommand } from "./commands/ping";
import { reportSlashCommand } from "./commands/report";
import { serverInfoMessageCommand, serverInfoSlashCommand } from "./commands/serverinfo";
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

	const memberId = "546036484591976468";
	const modId = "546033699725246484";
	const councilId = "645356739339747329";

	// Apply permissions
	configSlashCommand.addPermission(modId, "ROLE", true);
	configSlashCommand.addPermission(councilId, "ROLE", true);
	pingSlashCommand.addPermission(memberId, "ROLE", true);
	reportSlashCommand.addPermission(memberId, "ROLE", true);
	serverInfoSlashCommand.addPermission(memberId, "ROLE", true);
	serverInfoMessageCommand.addAllowed(memberId);
	uptimeSlashCommand.addPermission(memberId, "ROLE", true);
	uptimeMessageCommand.addAllowed(memberId);

	// Register Commands
	client.registerCommandObject(configSlashCommand);
	client.registerCommandObject(pingSlashCommand);
	client.registerCommandObject(reportSlashCommand);
	client.registerCommandObject(serverInfoSlashCommand);
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
