import { MessageEmbed, TextChannel } from "discord.js";
import { fromString } from "wandbox-api-updated";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "compile",
	description: "Execute code from Discord, see the *compilers* command to determine which compilers are available.",
	options: [
		{
			type: "STRING",
			name: "compiler",
			description: "Compiler to use.",
			required: true,
			choices: [
				{
					name: "C#",
					value: "mono-head",
				},
				{
					name: "C++",
					value: "gcc-head",
				},
				{
					name: "Java",
					value: "openjdk-head",
				},
				{
					name: "JavaScript",
					value: "nodejs-head",
				},
				{
					name: "Lua",
					value: "lua-5.4.0",
				},
				{
					name: "Python",
					value: "cpython-head",
				},
				{
					name: "TypeScript",
					value: "typescript-3.9.5",
				},
			],
		},
		{
			type: "STRING",
			name: "src",
			description: "Source to compile. Can also use the last message sent by you.",
		},
	],
	shouldBeEphemeral: interaction => interaction.channelId !== getState().config.botChannelId,
	handler: async (interaction, args) => {
		let codeParse = "";
		let missingSource = false;

		if (!args.get("src")) {
			// TODO: Fetch these out of channel.. :sob:
			const lastMessageId = undefined;
			const lastMessageChannelId = undefined;

			if (lastMessageChannelId && lastMessageId) {
				const message = (
					interaction.guild?.channels.resolve(lastMessageChannelId) as TextChannel
				).messages.resolve(lastMessageId);

				if (message) {
					codeParse = message.content;
					if (lastMessageChannelId !== getState().config.botChannelId) {
						message.delete().catch(console.error.bind(console));
					}
				} else {
					missingSource = true;
				}
			} else {
				missingSource = true;
			}
		} else {
			codeParse = args.get("src")?.value as string;
		}

		if (missingSource) {
			interaction
				.reply({
					content: "Failed to parse previous message, did you send one?",
					ephemeral: command.shouldBeEphemeral(interaction),
				})
				.catch(console.error.bind(console));
			return;
		}

		const code = /((```\S*)|`)?([\s\S]*?)`*$/g.exec(codeParse)?.splice(3).join(" ") ?? "";
		interaction
			.defer({ ephemeral: command.shouldBeEphemeral(interaction) })
			.then(() =>
				fromString({
					compiler: args.get("compiler")?.value as string,
					code: code,
					save: false,
				})
			)
			.then(result => {
				const embed = new MessageEmbed();

				if (result.compiler_error || result.program_error) {
					embed.setColor("#D95B18");
					embed.setDescription("Compilation failed: errors present.");
					embed.addField(
						"Errors",
						`\`\`\`\n${(result.compiler_error ?? result.program_error)
							.slice(0, 1000)
							.replace(/```/g, "")}\`\`\``,
						false
					);
				} else {
					embed.setColor("#24BF2F");
					embed.setDescription("Compilation finished.");
					embed.addField(
						"Program Message",
						`\`\`\`\n${result.program_message.slice(0, 1000).replace(/```/g, "")}\`\`\``,
						false
					);
				}

				interaction.editReply({ embeds: [embed] }).catch(err => log(err, "warn"));
			})
			.catch(err => {
				interaction.editReply({ content: String(err), allowedMentions: {} }).catch(err => log(err, "error"));
			});
	},
};

export default command;
