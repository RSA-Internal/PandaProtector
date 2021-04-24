import type { Command } from "../command";
import { defaultArgumentParser } from "../parsers";
import { getUserFromMention } from "../util";

const command: Command = {
	name: "report",
	description: "Report a user to staff.",
	options: [
		{
			name: "user",
			description: "The user to report.",
		},
		{
			name: "reason",
			description: "The reason for the report.",
		},
	],
	hasPermission: () => true,
	parseArguments: defaultArgumentParser,
	handler: (state, message, user, ...reason) => {
		const reasonText = reason.join(" ");
		const userObject = getUserFromMention(state.client, user);

		if (!userObject || userObject.id === message.author.id) {
			void message.reply("Could not report this user.").then(sent => void sent.delete({ timeout: 5000 }));
			return;
		}

		void reasonText;
	},
};

export default command;
