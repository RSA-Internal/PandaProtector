import { readFileSync } from "fs";
import { getCommand } from "./commands";
import { ephemeral } from "./ephemeral";
import { createState, isConfig, State } from "./state";

const configPath = process.argv[2] ?? "config.json";
const tokenName = process.argv[3] ?? "TOKEN";
const config = JSON.parse(readFileSync(configPath, "utf-8")) as unknown;
const version = (JSON.parse(readFileSync("package.json", "utf-8")) as { version: string })["version"];

function main(state: State, token: string) {
	const { client } = state;

	client.on("ready", () => {
		client.user
			?.setActivity(version, { type: "PLAYING" })
			.then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
			.catch(console.error);
	});

	client.on("message", message => {
		if (message.author.bot) {
			// Do not process bot messages.
			return;
		}

		if (message.channel.id === state.showcaseChannelId) {
			// Handle showcase.
			if (message.attachments.size === 0 && !/https?:\/\//.test(message.content)) {
				// Ensure messages in showcase contain an attachment or link.
				if (!message.member?.roles.cache.has(state.staffRoleId)) {
					message.delete().catch(console.error);
					return; // Do not do any further processing.
				}
			} else {
				// Add up vote and down vote reaction to message.
				// TODO: make emotes configurable in the future?
				message.react("👍").catch(console.error);
				message.react("👎").catch(console.error);
			}
		}

		if (message.content.startsWith(state.commandPrefix)) {
			// Handle commands.
			// TODO: https://github.com/RSA-Bots/PandaProtector/issues/3
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
						ephemeral(state, message.reply(`Missing arguments for **${commandName}**.`)).catch(
							console.error
						);
					}
				}
			}
		}
	});

	// TODO: https://github.com/RSA-Bots/PandaProtector/issues/4
	client.on("guildMemberUpdate", member => {
		if (member.roles.cache.array().length == 1) {
			// Give user the member role.
			member.roles.add(state.memberRoleId).catch(console.error);
		}
	});

	client.login(token).catch(error => console.error(error));
}

if (isConfig(config)) {
	const token = process.env[tokenName];

	if (token) {
		main(createState(config), token);
	} else {
		throw new Error(`Environment variable ${tokenName} does not exist.`);
	}
} else {
	throw new Error(`Config file ${configPath} does not match the Config interface.`);
}
