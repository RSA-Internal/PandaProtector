import { log } from "console";
import { ButtonInteraction, Guild, GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { getState } from "../store/state";

export function handleJoinButtons(
	interaction: ButtonInteraction,
	components: MessageActionRow[],
	guild: Guild,
	member: GuildMember,
	name: string
): void {
	if (member.roles.cache.has(getState().config.staffRoleId)) {
		if (components) {
			const idToInteract = (components[0].components as MessageButton[]).filter(
				button => button.customID === "memberId"
			)[0].label as `${bigint}`;

			if (idToInteract) {
				const memberToInteract = guild.members.cache.get(idToInteract);

				if (name === "ban") {
					guild.bans
						.create(idToInteract, {
							reason: `Banned by ${member.displayName}[${member.id}] via join embed.`,
						})
						.then(() => {
							interaction
								.update({
									embeds: interaction.message.embeds as MessageEmbed[],
									components: [
										new MessageActionRow().addComponents(
											new MessageButton()
												.setCustomID("banned")
												.setStyle("SECONDARY")
												.setLabel(`Banned by ${member.displayName}[${member.id}]`)
												.setDisabled(true)
										),
									],
								})
								.catch(err => log(err, "error"));
						})
						.catch(err => {
							log(err, "error");
							interaction
								.reply({
									ephemeral: true,
									content: `Failed to ban member. ${err as string}`,
								})
								.catch(err => log(err, "error"));
						});
					return;
				}

				if (memberToInteract) {
					if (name === "kick") {
						memberToInteract
							.kick(`Kicked by ${member.displayName}[${member.id}] via join embed.`)
							.then(() => {
								interaction
									.update({
										embeds: interaction.message.embeds as MessageEmbed[],
										components: [
											new MessageActionRow().addComponents(
												new MessageButton()
													.setCustomID("kicked")
													.setStyle("SECONDARY")
													.setLabel(`Kicked by ${member.displayName}[${member.id}]`)
													.setDisabled(true)
											),
										],
									})
									.catch(err => log(err, "error"));
							})
							.catch(err => {
								log(err, "error");
								interaction
									.reply({
										ephemeral: true,
										content: `Failed to kick member. ${err as string}`,
									})
									.catch(err => log(err, "error"));
							});
					}
				} else {
					interaction.reply({ ephemeral: true, content: "Invalid member." }).catch(err => log(err, "error"));
				}
			} else {
				interaction.reply({ ephemeral: true, content: "Invalid id." }).catch(err => log(err, "error"));
			}
		}
	}
}
