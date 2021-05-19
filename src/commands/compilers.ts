import { MessageEmbed } from "discord.js";
import { getCompilers } from "wandbox-api-updated";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";

const command: Command = {
	name: "compilers",
	description: "Gets a list of supported compilers for the specified language.",
	options: [
		{
			name: "language",
			description: "List of compilers for the specified language.",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (_, message, language) => {
		getCompilers(language)
			.then(list => {
				const listEmbed = new MessageEmbed({
					timestamp: message.createdTimestamp,
					color: "#FF000A",
				});

				list.forEach(compiler => {
					listEmbed.addField(`${language} ${compiler.version}`, `Compiler: ${compiler.name}`, true);
				});

				// Discord Embeds do not allow for more than 25 fields.
				listEmbed.fields.splice(25);

				message.reply(listEmbed).catch(console.error.bind(console));
			})
			.catch(err => {
				message.reply(err, { disableMentions: "all" }).catch(console.error.bind(console));
			});
	},
};

export default command;
