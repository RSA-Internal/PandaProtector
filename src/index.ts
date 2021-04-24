// import { Client } from "discord.js";
import { readFileSync } from "fs";
import { getCommand } from "./commands";
import { createState, isConfig, State } from "./state";

const configPath = process.argv[2] ?? "config-prod.json";
const config = JSON.parse(readFileSync(configPath, "utf-8")) as unknown;

function main(state: State, token: string) {
	const { client } = state;

	client.on("message", message => {
		console.log(message.content);

		// Handle commands.
		if (message.content.startsWith(state.commandPrefix)) {
			const content = message.content.slice(state.commandPrefix.length);
			const matches = /^(\w+)\s*(.*)/su.exec(content);
			const commandName = matches?.[1]?.toLowerCase() ?? "";
			const argumentContent = matches?.[2] ?? "";

			if (commandName.length > 0) {
				const command = getCommand(commandName);

				if (command && command.hasPermission(state, message)) {
					const args = command.parseArguments(argumentContent);
					const required = command.options.reduce((acc, option) => acc + (option.optional ? 0 : 1), 0);

					if (args.length >= required) {
						command.handler(state, message, ...command.parseArguments(argumentContent));
					} else {
						void message
							.reply(`Missing arguments for **${commandName}**.`)
							.then(sent => void sent.delete({ timeout: 5000 }));
					}
				}
			}

			return;
		}

		// Ensure messages in showcase contain an attachment or link.
		if (message.channel.id === state.showcaseChannelId) {
			if (message.attachments.size === 0 || !/https?:\/\//.test(message.content)) {
				void message.delete();
			}
		}
	});

	client.login(token).catch(error => console.error(error));
}

if (isConfig(config)) {
	const token = config.token;
	// Remove the token from the State object.
	(config as { token: string }).token = "";
	main(createState(config), token);
} else {
	throw new Error(`Config file ${configPath} does not match the Config interface.`);
}
