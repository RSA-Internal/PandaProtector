import { MessageEmbed } from "discord.js";
import { fromString } from "wandbox-api-updated";
import type { Command } from "../command";

const command: Command = {
	name: "compile",
	description: "Execute code from Discord, see the *compilers* command to determine which compilers are available.",
	options: [
		{
			type: "STRING",
			name: "compiler",
			description: "Compiler to use.",
			required: true,
		},
		{
			type: "STRING",
			name: "src",
			description: "Source to compile.",
			required: true,
		},
	],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (state, interaction, args) => {
		const code =
			/((```\S*)|`)?([\s\S]*?)`*$/g
				.exec(args[1]?.value as string)
				?.splice(3)
				.join(" ") ?? "";

		fromString({
			compiler: args[0].value as string,
			code: code,
			save: false,
		})
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

				interaction.reply(embed).catch(console.error.bind(console));
			})
			.catch(err => {
				// Replace { disabledMentions: "all" }
				interaction
					.reply(err, { allowedMentions: {}, ephemeral: command.shouldBeEphemeral(state, interaction) })
					.catch(console.error.bind(console));
			});
	},
};

export default command;
