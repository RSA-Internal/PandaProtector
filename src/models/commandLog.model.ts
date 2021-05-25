import { Document, model, Schema } from "mongoose";

export interface ICommandLog extends Document {
	readonly discordId: string;
	readonly command: string;
	readonly arguments: readonly string[];
}

export default model<ICommandLog>(
	"CommandLog",
	new Schema(
		{
			discordId: { type: String, index: true, required: true },
			command: { type: String, required: true },
			arguments: { type: [String], required: false },
		},
		{ timestamps: true }
	)
);
