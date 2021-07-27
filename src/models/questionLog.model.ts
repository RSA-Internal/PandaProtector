import { Document, model, Schema } from "mongoose";

export interface IQuestion extends Document {
	readonly questionID: number;
	readonly authorID: string;
	readonly title: string;
	readonly body: string;
	readonly comments: IComment[];
	readonly answers: IAnswer[];
	readonly acceptedAnswer: string;
	readonly discordMessageID: string;
	readonly threadID: string;
}

export interface IAnswer extends Document {
	readonly answerID: number;
	readonly authorID: string;
	readonly content: string;
	readonly accepted: boolean;
	readonly upvotes: number;
	readonly downvotes: number;
	readonly attachedID: number;
	readonly discordMessageID: string;
	readonly threadID: string;
}

export interface IComment extends Document {
	readonly commentID: number;
	readonly authorID: string;
	readonly content: string;
	readonly attachedID: number;
	readonly type: string;
}

const commentModel = model<IComment>(
	"Comment",
	new Schema(
		{
			commentID: { type: Number, index: true, required: true },
			authorID: { type: String, required: true },
			content: { type: String, required: true },
			attachedID: { type: Number, index: true, required: true },
			type: { type: String, index: true, required: true },
		},
		{
			timestamps: true,
		}
	)
);

const answerModel = model<IAnswer>(
	"Answer",
	new Schema(
		{
			answerID: { type: Number, index: true, required: true },
			authorID: { type: String, required: true },
			content: { type: String, required: true },
			accepted: { type: Boolean, required: false, default: false },
			upvotes: { type: Number, required: false, default: 0 },
			downvotes: { type: Number, required: false, default: 0 },
			attachedID: { type: Number, required: true },
			discordMessageID: { type: String, required: false, default: "" },
			threadID: { type: String, required: false, default: "" },
		},
		{
			timestamps: true,
		}
	)
);

const questionModel = model<IQuestion>(
	"Question",
	new Schema(
		{
			questionID: { type: Number, index: true, required: true },
			authorID: { type: String, required: true },
			title: { type: String, required: true },
			body: { type: String, required: true },
			comments: { type: [commentModel.schema], required: false, default: [] },
			answers: { type: [answerModel.schema], required: false, default: [] },
			acceptedAnswer: { type: String, required: false, default: "" },
			discordMessageID: { type: String, required: false, default: "" },
			threadID: { type: String, required: false, default: "" },
		},
		{ timestamps: true }
	)
);

export { commentModel, answerModel, questionModel };
