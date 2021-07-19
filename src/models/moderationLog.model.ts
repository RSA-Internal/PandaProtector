import { Document, model, Schema } from "mongoose";

export interface IModerationLog extends Document {
	readonly userId: string;
	readonly moderatorId: string;
	readonly reason: string;
	readonly type: string;
	readonly endTime: Date;
	readonly removed: boolean;
}

export default model<IModerationLog>(
	"ModerationLog",
	new Schema(
		{
			userId: { type: String, index: true, required: true },
			moderatorId: { type: String, required: true },
			reason: { type: String, required: true },
			type: { type: String, required: true },
			endTime: { type: Date, required: false },
			removed: { type: Boolean, required: false },
		},
		{ timestamps: true }
	)
);
