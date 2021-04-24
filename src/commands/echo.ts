import type { Command } from "../command";

const command: Command = {
	name: "echo",
	description: "Prints some text.",
	options: [
		{
			name: "text",
			description: "The text to print.",
		},
	],
	hasPermission: () => true,
	parseArguments: content => [content],
	handler: (_, message, text) => {
		void message.channel.send(`[<@${message.author.id}>]: ${text}`, {
			disableMentions: "everyone",
		});
	},
};

export default command;
