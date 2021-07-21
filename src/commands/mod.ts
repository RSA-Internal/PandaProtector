import { EmbedFieldData, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import moderationLogModel from "../models/moderationLog.model";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const mods = {
	m: 60,
	h: 3600,
	d: 86400,
	w: 604800,
	mo: 2592000,
	y: 31536000,
} as { [key: string]: number };

// TODO: Handle caching of mutes/tempbans on load
// TODO: Store timed infraction to []

const command: Command = {
	name: "mod",
	description: "moderation command",
	options: [
		{
			name: "user",
			type: "USER",
			description: "user to moderate",
			required: true,
		},
		{
			name: "reason",
			type: "STRING",
			description: "reason for moderation",
			required: true,
		},
		{
			name: "action",
			type: "STRING",
			description: "type of moderation",
			required: true,
			choices: [
				{
					name: "Warn",
					value: "warn",
				},
				{
					name: "Mute",
					value: "mute",
				},
				{
					name: "Kick",
					value: "kick",
				},
				{
					name: "Ban",
					value: "ban",
				},
			],
		},
		{
			name: "duration",
			type: "STRING", //to allow for 1h, 30m, 2d etc
			description: "Duration of punishment",
		},
	],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: async (interaction, args) => {
		await interaction.defer({ ephemeral: true });

		const guild = interaction.guild;

		if (!guild) {
			await interaction.editReply("Failed to handle command.").catch(console.warn.bind(console));
			return;
		}

		const userArg = args.get("user");
		const reasonArg = args.get("reason");
		const actionArg = args.get("action");
		const durationArg = args.get("duration");

		if (userArg && reasonArg && actionArg) {
			const userId = userArg.value as `${bigint}`;
			let member: GuildMember | undefined;
			if (guild) {
				member = await guild.members.fetch(userId);
			}

			const reason = String(reasonArg.value);
			const action = String(actionArg.value);
			const actionBased =
				action === "warn" ? "warned" : action === "kick" ? "kicked" : action === "mute" ? "muted" : "banned";
			let duration = "0";
			if (durationArg && (action === "mute" || action === "ban")) {
				duration = String(durationArg.value);
			}

			let endDate: Date = new Date(Date.now());

			if (duration && duration !== "0") {
				const modifier = duration[duration.length - 1];
				const value = parseInt(duration.slice(0, duration.length - 1)) * 1000 * (mods[modifier] ?? 1);

				endDate = new Date(Date.now() + value);
			}

			let result = `${action}ing ${member?.displayName ?? userId}.\nReason: ${reason}${
				action === "mute" || action === "ban" ? `\nDuration: ${duration}` : ""
			}`;

			moderationLogModel
				.create({
					userId: userId,
					moderatorId: interaction.user.id,
					reason: reason,
					type: action,
					endTime: endDate,
					removed: false,
				})
				.catch(console.error.bind(console));

			const logChannel = guild?.channels.cache.get(
				getState().config.modActionLogChannelId as `${bigint}`
			) as TextChannel;

			const defFields = [
				{
					name: "User",
					value: member?.displayName ?? userId,
					inline: true,
				},
				{
					name: "Moderator",
					value: guild?.members.cache.get(interaction.user.id)?.displayName ?? interaction.user.id,
					inline: true,
				},
			] as EmbedFieldData[];

			if (duration && (action === "mute" || action === "ban")) {
				defFields.push({
					name: "Duration",
					value: action === "ban" && duration === "0" ? "∞" : duration,
					inline: true,
				});
			}

			if (endDate) {
				defFields.push({
					name: "End Date",
					value: endDate.toDateString(),
					inline: true,
				});
			}

			defFields.push({
				name: "Reason",
				value: reason,
				inline: false,
			});

			if (logChannel) {
				logChannel
					.send({
						embeds: [
							new MessageEmbed().setTitle(`User ${actionBased}`).setColor(`BLURPLE`).addFields(defFields),
						],
					})
					.catch(console.warn.bind(console));
			}

			if (member) {
				await member.user
					.createDM()
					.then(channel => {
						channel
							.send({
								embeds: [
									new MessageEmbed()
										.setTitle(`You have been ${actionBased} in ${guild.name}`)
										.setColor(`RED`)
										.setDescription(reason)
										.addField(
											action === "mute" || action === "ban"
												? "Infraction End Date"
												: "Infraction Falloff Date",
											action === "mute" || action === "ban"
												? duration === "0"
													? "Never"
													: endDate.toDateString()
												: new Date(Date.now() + 7776000000).toDateString(),
											false
										)
										.addField(
											"Appeal Process",
											action === "ban"
												? `If you would like to appeal a ban, please submit your request [here](https://forms.gle/C6aHgEXKUWqHKXCf8)`
												: "If you feel that this was an invalid moderation, please reach out to the staff team.",
											false
										),
								],
							})
							.catch(console.warn.bind(console));
					})
					.catch(console.warn.bind(console));

				if (action === "mute") {
					const muteRoleId = getState().config.mutedRoleId;

					if (muteRoleId.length === 0) {
						result += "\n\nNo mute role ID set, failed to mute member.";
					} else {
						const role = guild.roles.resolveID(muteRoleId as `${bigint}`);

						if (role) {
							member.roles.add(role).catch(console.warn.bind(console));
						} else {
							result += `\n\nNo role with ID ${muteRoleId} exists in the guild.`;
						}
					}
				}
				if (action === "kick") {
					member.kick(reason).catch(console.warn.bind(console));
				}
				if (action === "ban") {
					member.ban({ reason }).catch(console.warn.bind(console));
				}
			}

			interaction
				.editReply({
					content: result,
				})
				.catch(console.error.bind(console));
			return;
		} else {
			interaction.editReply({ content: "Failed to parse arguments." }).catch(console.error.bind(console));
			return;
		}
	},
};

export default command;
