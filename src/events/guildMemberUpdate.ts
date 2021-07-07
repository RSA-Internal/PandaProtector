import { log } from "console";
import type { GuildMember, PartialGuildMember } from "discord.js";
import { getState } from "../store/state";
import type { Event } from "../types/event";

const event: Event = {
	name: "guildMemberUpdate",
	execute: (...args) => {
		log(`Firing event: ${event.name}`, "debug");
		const oldMember = [...args][0] as unknown as GuildMember | PartialGuildMember;
		const newMember = [...args][1] as unknown as GuildMember;

		const config = getState().config;

		if (oldMember && newMember) {
			if (oldMember.pending) {
				newMember.roles.add(config.memberRoleId).catch(err => log(err, "error"));
			}

			if (JSON.parse(config.removeMemberRoleOnMute)) {
				if (newMember.roles.cache.has(config.mutedRoleId as `${bigint}`)) {
					newMember.roles.remove(config.memberRoleId).catch(err => log(err, "error"));
				} else if (!newMember.roles.cache.has(config.mutedRoleId as `${bigint}`)) {
					newMember.roles.add(config.memberRoleId).catch(err => log(err, "error"));
				}
			}
		}
	},
};

export default event;
