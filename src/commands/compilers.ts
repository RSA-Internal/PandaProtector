import { MessageEmbed } from "discord.js";
import { getCompilers } from "wandbox-api-updated";
import type { Command } from "../command";

const command: Command = {
	name: "compilers",
	description: "Gets a list of supported compilers for the specified language.",
	options: [
		{
			type: "STRING",
			name: "language",
			description: "List of compilers for the specified language.",
			required: true,
		},
	],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => interaction.channelID !== state.config.botChannelId,
	handler: (_, interaction, args) => {
		const language = args[0].value as string;

		getCompilers(language)
			.then(list => {
				const listEmbed = new MessageEmbed({
					timestamp: interaction.createdTimestamp,
					color: "#FF000A",
				});

				list.forEach(compiler => {
					listEmbed.addField(`${language} ${compiler.version}`, `Compiler: ${compiler.name}`, true);
				});

				// Discord embeds do not allow for more than 25 fields.
				listEmbed.fields.splice(25);

				interaction.reply(listEmbed).catch(console.error.bind(console));
			})
			.catch(err => {
				interaction.reply(err, { allowedMentions: {} }).catch(console.error.bind(console));
			});
	},
};

export default command;
