import type { GuildMemberRoleManager } from "discord.js";
import type { Command } from "../types/command";
import { log } from "../logger";
import { getPermissions } from "../store/permissions";
import { getState } from "../store/state";

const command: Command = {
	name: "permissions",
	description: "Modify a members permissions.",
	options: [
		{
			type: "USER",
			name: "user",
			description: "The user to modify.",
			required: true,
		},
		{
			type: "STRING",
			name: "modification",
			description: "Allow or revoke?",
			required: true,
			choices: [
				{
					name: "allow",
					value: "allow",
				},
				{
					name: "revoke",
					value: "revoke",
				},
			],
		},
		{
			type: "STRING",
			name: "command",
			description: "Command to modify.",
			required: true,
		},
	],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: (interaction, args) => {
		const guildID = interaction.guildID as `${bigint}`;
		const user = args.get("user")?.user?.id as `${bigint}`;
		const modification = args.get("modification")?.value as string;
		const command = args.get("command")?.value as string;

		const commandObject = interaction.client.guilds.cache
			.get(getState().config.guildId)
			?.commands.cache.filter(cmd => cmd.name === command);

		const perms = getPermissions(command);

		if (
			perms.field === "developerRoleId" &&
			!(interaction.member?.roles as GuildMemberRoleManager).cache.has(getState().config.developerRoleId)
		) {
			interaction
				.reply({ content: "Can not modify developer command permissions.", ephemeral: true })
				.catch(err => log(err, "error"));
			return;
		}

		if (guildID === undefined) {
			interaction.reply({ content: "Something went wrong.", ephemeral: true }).catch(err => log(err, "error"));
			return;
		}

		if (user === undefined) {
			interaction.reply({ content: "Invalid user provided.", ephemeral: true }).catch(err => log(err, "warn"));
			return;
		}

		if (commandObject) {
			const slashCommand = commandObject.first();
			if (slashCommand === undefined) {
				interaction
					.reply({ content: "Invalid command provided.", ephemeral: true })
					.catch(err => log(err, "warn"));
				return;
			}

			slashCommand.manager.permissions
				.add({
					command: slashCommand,
					guild: guildID,
					permissions: [
						{
							id: user,
							type: "USER",
							permission: modification === "allow" ? true : false,
						},
					],
				})
				.catch(err => log(err, "warn"));

			interaction
				.reply({ content: `Successfully modified permissions for user.`, ephemeral: true })
				.catch(err => log(err, "warn"));
		} else {
			interaction
				.reply({ content: "Could not find valid interaction.", ephemeral: true })
				.catch(err => log(err, "warn"));
		}
	},
};

export default command;
