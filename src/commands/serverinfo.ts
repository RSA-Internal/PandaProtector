import { MessageEmbed } from "discord.js";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "serverinfo",
	description: "Show info about the server.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: async interaction => {
		await interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) }).catch(err => log(err, "error"));
		const embed = new MessageEmbed().setTitle("Server Info");
		const guild = interaction.guild;

		if (guild) {
			embed.addField("Server Name", guild.name, true);
			embed.addField("Server ID", guild.id, true);
			embed.addField("Invite", guild.invites.cache.first()?.code ?? "No invites found.", true);
			embed.addField("Member Count", guild.memberCount.toString(), true);
			embed.addField("Role Count", guild.roles.cache.size.toString(), true);
			embed.addField(
				"Text Channels",
				guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT").size.toString(),
				true
			);
			embed.addField(
				"Voice Channels",
				guild.channels.cache.filter(channel => channel.type === "GUILD_VOICE").size.toString(),
				true
			);

			interaction.editReply({ embeds: [embed] }).catch(err => log(err, "error"));
		}
	},
};

export default command;
