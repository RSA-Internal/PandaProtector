import * as https from "https";
import { fromStringV2 } from "wandbox-api-updated";
import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";

interface Switch {
	default: boolean;
	"display-flags": string;
	"display-name": string;
	name: string;
	type: string;
}

interface Compiler {
	"compiler-option-raw": boolean;
	"display-compile-command": string;
	"display-name": string;
	language: string;
	name: string;
	provider: number;
	"runtime-option-raw": boolean;
	switches: Array<Switch>;
	templates: Array<string>;
	version: string;
}

const command: Command = {
	name: "compile",
	description: "Execute code from discord.",
	options: [
		{
			name: "compiler",
			description: "Compiler to use",
		},
		{
			name: "src",
			description: "Source to compile",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (state, message, compiler, ...src) => {
		if (compiler == "langs") {
			// fetch list of langs from wandbox.org/api/list.json
			// format and parse display-name, language, version
			// TODO: future implementation -- switches
			let result = "";

			https
				.get("https://wandbox.org/api/list.json", res => {
					res.on("data", d => {
						result += d;
					});
					res.on("close", () => {
						const list = [] as string[];
						const langToCheck = src.join(" ").toLowerCase();

						const compilerDataList = JSON.parse(result) as Compiler[];

						compilerDataList.forEach(compiler => {
							if (compiler.language.toLowerCase() == langToCheck) {
								list.push(`${compiler.language} ${compiler.version}: ${compiler.name}`);
							}
						});

						message.reply("Results\n" + list.join("\n").slice(0, 1000)).catch(console.error);
					});
				})
				.on("error", console.error);
		} else {
			fromStringV2(
				{
					compiler: compiler,
					code: src.join(" "),
					save: false, //reimplement at a later date, or under `scompile.ts`
				},
				function (err, res) {
					console.log(res);
					if (err) {
						message.reply(`Compilation failed.\n${err.message}`).catch(console.error);
					} else {
						if (res.compiler_error) {
							message.reply(`Compilation failed.\n${res.compiler_message}`).catch(console.error);
						} else {
							message.reply(res.program_output).catch(console.error);
						}
					}
				},
				undefined
			);
		}
	},
};

export default command;
