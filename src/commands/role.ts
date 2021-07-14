import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { log } from "../logger";
import { getState } from "../store/state";
import type { Command } from "../types/command";

const command: Command = {
	name: "role",
	description: "Add roles from a list.",
	options: [],
	shouldBeEphemeral: interaction => interaction.channelID !== getState().config.botChannelId,
	handler: async interaction => {
		const roles = (await interaction.guild?.roles.fetch())
			?.filter(role => role.permissions.bitfield === BigInt(0))
			.map(role => {
				return {
					label: role.name.substr(0, 24),
					value: role.id,
				};
			});

		if (!roles) {
			interaction
				.reply("Unable to fetch roles at this time. Please try again later.")
				.catch(err => log(String(err), "error"));
			return;
		}

		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomID("select")
				.setPlaceholder("Nothing selected")
				.setMinValues(1)
				.setMaxValues(roles.length)
				.addOptions(roles)
		);

		interaction
			.reply({ content: "Role Selector!", components: [row], ephemeral: true })
			.catch(err => log(err, "error"));
	},
};

export default command;
