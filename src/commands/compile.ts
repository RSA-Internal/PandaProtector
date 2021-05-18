import { MessageEmbed } from "discord.js";
import { fromString } from "wandbox-api-updated";
import type { Command } from "../command";

const command: Command = {
	name: "compile",
	description:
		'Execute code from discord. There are two uses to this command: `;compile langs [languageFilter]`, which will list all compilers and the language version for the provided language. (ex: `;compile langs C++`). The other is `compile [compiler] [src]`. (ex: `compile lua-5.4.0 print("Hello World!")`)',
	options: [
		{
			name: "compiler",
			description: "Compiler to use.",
		},
		{
			name: "src",
			description: "Source to compile.",
		},
	],
	hasPermission: () => true,
	parseArguments: content => /\s*(\S+)\s*([\s\S]+)/g.exec(content)?.splice(1) ?? [],
	handler: (_, message, compiler, src) => {
		fromString({ compiler: compiler, code: src.length == 0 ? "" : src === "0" ? "" : src, save: false })
			.then(result => {
				const embed = new MessageEmbed();

				if (result.compiler_error) {
					embed.setColor("#D95B18");
					embed.setDescription("Compilation failed: compiler errors present.");
					embed.addField("Compiler Error", result.compiler_error, false);
				} else {
					embed.setColor("#24BF2F");
					embed.setDescription("Compilation finished.");
					embed.addField("Program Message", result.program_message, false);
				}

				message.reply(embed).then(console.log.bind(console)).catch(console.error.bind(console));
			})
			.catch(err => {
				void message.reply(err);
			});
	},
};

export default command;
