import { MessageEmbed } from "discord.js";
import { getCompilers } from "wandbox-api-updated";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";

const command: Command = {
	name: "compilers",
	description: "testing",
	options: [
		{
			name: "language",
			description: "List compilers for provided language",
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

				message.reply(listEmbed).then(console.log.bind(console)).catch(console.error.bind(console));
			})
			.catch(console.error.bind(console));
	},
};

export default command;
