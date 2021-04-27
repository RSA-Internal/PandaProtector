import { fromStringV2 } from "wandbox-api-updated";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";

const command: Command = {
	name: "compile",
	description: "Execute code from discord.",
	options: [
		{
			name: "lang",
			description: "Language to compile against",
		},
		{
			name: "save",
			description: "Save the code or not",
		},
		{
			name: "src",
			description: "Source to compile",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (state, message, lang, save, ...src) => {
		fromStringV2(
			{
				compiler:
					lang == "C"
						? "gcc-head-c"
						: lang == "C#"
						? "mono-head"
						: lang == "C++" || lang == "CPP"
						? "gcc-head"
						: lang == "Haskell"
						? "ghc-head"
						: lang == "Java"
						? "openjdk-head"
						: lang == "JavaScript" || lang == "js"
						? "nodejs-head"
						: lang == "lisp" || lang == "clisp"
						? "clisp-2.49"
						: lang == "lua"
						? "lua-5.4.0"
						: lang == "pascal"
						? "fpc-head"
						: lang == "python"
						? "pypy-head"
						: lang == "ruby"
						? "ruby-head"
						: lang == "rust"
						? "rust-head"
						: lang == "scala"
						? "scala-2.13.x"
						: lang == "TypeScript" || lang == "ts"
						? "typescript-3.9.5"
						: "lua-5.4.0",
				code: src.join(" "),
				save: save == "true",
			},
			function (err, res) {
				if (err) {
					message.reply(`Compilation failed.\n${err.message}`).catch(reason => console.error(reason));
				} else {
					message.reply(res).catch(reason => console.error(reason));
				}
			},
			undefined
		);
	},
};

export default command;
