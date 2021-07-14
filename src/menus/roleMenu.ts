import type { SelectMenuInteraction, Snowflake } from "discord.js";
import { log } from "../logger";

export function handleRoleSelector(interaction: SelectMenuInteraction): void {
	console.log(interaction);

	const choices = interaction.values;
	const member = interaction.guild?.members.cache.get(interaction.user.id);

	if (!member) {
		interaction
			.update({ content: "Failed to retrieve member data.", components: [] })
			.catch(err => log(String(err), "error"));
		return;
	}

	let added = 0;
	let removed = 0;

	choices?.forEach(choice => {
		if (member.roles.cache.has(choice as Snowflake)) {
			removed++;
			member.roles.remove(choice as Snowflake).catch(err => log(err, "error"));
		} else {
			added++;
			member.roles.add(choice as Snowflake).catch(err => log(err, "error"));
		}
	});

	const result = `Roles were updated!${added > 0 ? ` Added: ${added}` : ""}${added > 0 && removed > 0 ? " | " : ""}${
		removed > 0 ? ` Removed: ${removed}` : ""
	}`;

	interaction.update({ content: result, components: [] }).catch(err => log(String(err), "error"));
}
