import { Document, model, Schema } from "mongoose";

/*
00 - Moderator Note		40 - Kick
20 - Warning			50 - Temporary Ban
30 - Mute				60 - Permanent Ban
*/

export interface IModeratedMessageLog extends Document {
	readonly messageId: string;
	readonly channelId: string;
	readonly messageContent: string;
}

export default model<IModeratedMessageLog>(
	"ModeratedMessageLog",
	new Schema(
		{
			messageId: { type: String, index: true, required: true },
			channelId: { type: String, required: true },
			messageContent: { type: String, required: true },
		},
		{ timestamps: true }
	)
);
