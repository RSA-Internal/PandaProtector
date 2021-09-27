import { MessageCommand, MessageEmbed, SlashCommand } from "pandawrapper";

export const serverInfoSlashCommand = new SlashCommand("serverinfo", "Display info about the server");
serverInfoSlashCommand.setCallback(async interaction => {
	await interaction.deferReply();
	const embed = new MessageEmbed().setTitle("Server Info");
	const guild = interaction.guild;

	if (guild) {
		const invites = guild.invites.cache;
		embed.addField("Server Name", guild.name, true);
		embed.addField("Server ID", guild.id, true);
		embed.addField("Invite", invites.first()?.code ?? "No invites found.", true);
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

		await interaction.editReply({ embeds: [embed] });
	}
});

export const serverInfoMessageCommand = new MessageCommand("serverinfo");
serverInfoMessageCommand.setCallback(message => {
	const embed = new MessageEmbed().setTitle("Server Info");
	const guild = message.guild;

	if (guild) {
		const invites = guild.invites.cache;
		embed.addField("Server Name", guild.name, true);
		embed.addField("Server ID", guild.id, true);
		embed.addField("Invite", invites.first()?.code ?? "No invites found.", true);
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

		message.reply({ embeds: [embed] }).catch(console.error.bind(console));
	}
});
