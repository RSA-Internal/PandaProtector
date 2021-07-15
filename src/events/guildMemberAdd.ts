import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { getState } from "../store/state";
import type { Event } from "../types/event";

type RetainedUser = { member: GuildMember; joined: Date };
type RaiderGroup = { suspects: GuildMember[]; groupTimeId: Date; groupId: number };
const joinedMembers: RetainedUser[] = [];
const suspectedRaiders: RaiderGroup[] = [];
let groupIdNumber = 0;
const reportChannel = getState().client.channels.cache.get(getState().config.reportChannelId) as TextChannel;
const accountCreateRadiation = {
	days: 0,
	hours: 2,
	minutes: 0,
};
const accountJoinedRadiation = {
	days: 0,
	hours: 0,
	minutes: 10,
};
const warningThreshhold = 3;

function getRadiationTimes(
	processingTime: Date,
	radiation: { days: number; hours: number; minutes: number }
): { radiationTail: Date; radiationHead: Date } {
	const radiationTail = new Date(processingTime);
	const radiationHead = new Date(processingTime);
	radiationTail.setDate(radiationTail.getDate() - radiation.days);
	radiationTail.setHours(radiationTail.getHours() - radiation.hours);
	radiationTail.setMinutes(radiationTail.getMinutes() - radiation.minutes);
	radiationTail.setDate(radiationTail.getDate() + radiation.days);
	radiationTail.setHours(radiationTail.getHours() + radiation.hours);
	radiationTail.setMinutes(radiationTail.getMinutes() + radiation.minutes);
	return { radiationTail, radiationHead };
}

function withinRadiationType(
	baseTime: Date,
	processingTime: Date,
	type: { days: number; hours: number; minutes: number }
): boolean {
	const { radiationTail, radiationHead } = getRadiationTimes(baseTime, type);
	if (radiationHead < processingTime && processingTime > radiationTail) {
		return true;
	} else {
		return false;
	}
}

function getActiveRaidGroup(): RaiderGroup | null {
	suspectedRaiders.forEach(rGroup => {
		const foresight = new Date(rGroup.groupTimeId);
		foresight.setMinutes(foresight.getMinutes() + 10);
		if (foresight > new Date()) {
			return rGroup;
		}
	});
	return null;
}

const event: Event = {
	name: "guildMemberAdd",
	execute: async (...args) => {
		let warningIndication = 0;
		const userMember = args[0] as unknown as GuildMember;
		joinedMembers.push({ member: userMember, joined: userMember.joinedAt ? userMember.joinedAt : new Date() });
		joinedMembers.forEach(listedMember => {
			if (
				listedMember.member !== userMember &&
				withinRadiationType(
					userMember.user.createdAt,
					listedMember.member.user.createdAt,
					accountCreateRadiation
				) &&
				withinRadiationType(userMember.joinedAt || new Date(), listedMember.joined, accountJoinedRadiation)
			) {
				warningIndication += 1;
			}
		});
		if (warningIndication >= warningThreshhold) {
			const suspectGroup: GuildMember[] = [];
			let suspectMentions = "";
			joinedMembers.forEach(listedMember => {
				if (
					withinRadiationType(
						userMember.user.createdAt,
						listedMember.member.user.createdAt,
						accountCreateRadiation
					) &&
					withinRadiationType(userMember.joinedAt || new Date(), listedMember.joined, accountJoinedRadiation)
				) {
					suspectGroup.push(listedMember.member);
					suspectMentions += `<@${listedMember.member.user.id}>` + "\n";
				}
			});
			const activeRaidGroup = getActiveRaidGroup() || {
				suspects: null,
				groupTimeId: new Date(),
				groupId: ++groupIdNumber,
			};
			activeRaidGroup.suspects = suspectGroup;
			await reportChannel.send({
				embeds: [
					new MessageEmbed({
						fields: [
							{
								name: "Reporter",
								value: `AUTOMATION`,
								inline: true,
							},
							{
								name: "Accused",
								value: `BULK`,
								inline: true,
							},
							{
								name: "Jump Link",
								value: `N/A`,
								inline: true,
							},
							{
								name: "Reason",
								value: `Review potential raiders.` + "\n" + suspectMentions,
							},
						],
						timestamp: new Date(),
						color: "#FF0000",
					}),
				],
			});
		}
	},
};

export default event;
