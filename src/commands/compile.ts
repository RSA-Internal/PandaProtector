import { MessageEmbed } from "discord.js";
import * as https from "https";
import { fromStringV2 } from "wandbox-api-updated";
import type { Command } from "../command";

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
	description:
		'Execute code from discord. There are two uses to this command: `;compile langs [languageFilter]`, which will list all compilers and the language version for the provided language. (ex: `;compile langs C++`). The other is `compile [compiler] [src]`. (ex: `compile lua-5.4.0 print("Hello World!")`)',
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
	parseArguments: content => /\s*(\S+)\s*([\s\S]+)/g.exec(content)?.splice(1) ?? [],
	handler: (state, message, compiler, src) => {
		if (compiler == "langs") {
			// TODO: future implementation -- switches
			let result = "";

			https
				.get("https://wandbox.org/api/list.json", res => {
					res.on("data", d => {
						result += d;
					});
					res.on("close", () => {
						const list = [] as string[];
						const langToCheck = src.toLowerCase();

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
			console.log(src);
			fromStringV2(
				{
					compiler: compiler,
					code: src,
					save: false, //reimplement at a later date, or under `scompile.ts`
				},
				function (err, res) {
					const embed = new MessageEmbed().setTitle("Compile Result").setFooter(`Compiled with: ${compiler}`);
					if (err) {
						embed.setColor("#BB3333");
						embed.setDescription("Compilation failed: Errors present.");
						embed.addField("Error", err.message, true);
					} else {
						if (res.compiler_error) {
							embed.setColor("#D95B18");
							embed.setDescription("Compilation failed: Compiler errors preset.");
							embed.addField("Compiler Error", res.compiler_error, false);
							if (res.compiler_message) {
								embed.addField("Compiler Message", res.compiler_message, false);
							}
							if (res.compiler_output) {
								embed.addField("Compiler Output", res.compiler_output, false);
							}
						} else {
							embed.setColor("#24BF2F");
							embed.setDescription("Compilation finished.");
							if (res.program_message) {
								embed.addField("Program Message", res.program_message || "No message.", false);
							}
							if (res.program_output) {
								embed.addField("Program Output", res.program_output || "No output.", false);
							}
							if (res.program_error) {
								embed.addField("Program Error", res.program_error || "No error.", false);
							}
						}
					}

					message.reply(embed).catch(console.error);
				},
				undefined
			);
		}
	},
};

export default command;