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
                compiler: "lua-5.4.0",
                code: src.join(" "),
                save: save == 'true'
            },
            function( err, res ) {
                if ( err ) {
                    message.reply(`Compilation failed.\n${err.message}`);
                } else {
                    message.reply(res);
                }
            },
            undefined
        );
	},
};

export default command;
