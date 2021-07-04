import { MessageEmbed } from "discord.js";
import type { Command } from "../command";
import { log } from "../logger";
import { getState } from "../store/state";

const command: Command = {
	name: "serverinfo",
	description: "Show info about the server.",
	options: [],
	hasPermission: () => true,
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: interaction => {
		interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) }).catch(err => log(err, "error"));
		const embed = new MessageEmbed().setTitle("Server Info");
		const guild = interaction.guild;

		if (guild) {
			guild
				.fetchInvites()
				.then(invites => {
					embed.addField("Server Name", guild.name, true);
					embed.addField("Server ID", guild.id, true);
					embed.addField("Invite", invites.first()?.code ?? "No invites found.", true);
					embed.addField("Member Count", guild.memberCount.toString(), true);
					embed.addField("Role Count", guild.roles.cache.size.toString(), true);
					embed.addField(
						"Text Channels",
						guild.channels.cache.filter(channel => channel.type === "text").size.toString(),
						true
					);
					embed.addField(
						"Voice Channels",
						guild.channels.cache.filter(channel => channel.type === "voice").size.toString(),
						true
					);
				})
				.then(() => {
					interaction.editReply(embed).catch(err => log(err, "error"));
				})
				.catch(err => log(err, "error"));
		}
	},
};

export default command;
