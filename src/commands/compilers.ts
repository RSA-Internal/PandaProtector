import { MessageEmbed } from "discord.js";
import { getCompilers } from "wandbox-api-updated";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";

const command: Command = {
	name: "compilers",
	description: "Gets a list of supported compilers for the specified language.",
	options: [
		{
			type: "STRING",
			name: "language",
			description: "List of compilers for the specified language.",
		},
	],
	hasPermission: () => true,
	shouldBeEphemeral: (state, interaction) => {
		return interaction.channelID != state.config.botChannelId;
	},
	parseArguments: defaultArgumentParser,
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

				// Discord Embeds do not allow for more than 25 fields.
				listEmbed.fields.splice(25);

				interaction.reply(listEmbed).catch(console.error.bind(console));
			})
			.catch(err => {
				// Replace { disabledMentions: "all" }
				interaction.reply(err, { allowedMentions: { parse: [] } }).catch(console.error.bind(console));
			});
	},
};

export default command;
