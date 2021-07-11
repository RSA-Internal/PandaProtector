import { Document, model, Schema } from "mongoose";

/*
00 - Moderator Note		40 - Kick
20 - Warning			50 - Temporary Ban
30 - Mute				60 - Permanent Ban
*/

enum ActionLevel {
	ModeratorNote = 0,
	Warning = 20,
	Mute = 30,
	Kick = 40,
	TemporaryBan = 50,
	PermanentBan = 60,
}

export interface IModerationActionLog extends Document {
	readonly caseNumber: number;
	readonly offenderId: string;
	readonly moderatorId: string;
	readonly actionLevel: ActionLevel;
	readonly reason: string;
	readonly messageId: string;
	readonly channelId: string;
	publicRemoved: boolean;
	note: string;
	createdAt: Date;
}

export default model<IModerationActionLog>(
	"ModerationActionLog",
	new Schema(
		{
			caseNumber: { type: Number, required: true },
			offenderId: { type: String, index: true, required: true },
			moderatorId: { type: String, required: true },
			actionLevel: { type: Number, required: true },
			reason: { type: String, required: true },
			messageId: { type: String, required: false },
			channelId: { type: String, required: false },
			publicRemoved: { type: Boolean, required: false, default: false },
			note: { type: String, required: false },
		},
		{ timestamps: true }
	)
);
