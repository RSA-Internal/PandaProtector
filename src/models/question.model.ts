import { Document, model, Schema } from "mongoose";

export interface IQuestion extends Document {
	readonly questionID: number;
	readonly authorID: string;
	readonly title: string;
	readonly body: string;
	readonly comments: IComment[];
	readonly answers: IAnswer[];
	readonly acceptedAnswer: string;
}

export interface IAnswer extends Document {
	readonly authorID: string;
	readonly content: string;
	readonly accepted: boolean;
	readonly upvotes: number;
	readonly downvotes: number;
}

export interface IComment extends Document {
	readonly authorID: string;
	readonly content: string;
}

const commentModel = model<IComment>(
	"Comment",
	new Schema(
		{
			authorID: { type: String, index: true, required: true },
			content: { type: String, required: true },
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
			authorID: { type: String, index: true, required: true },
			content: { type: [String], required: true },
			accepted: { type: Boolean, required: false, default: false },
			upvotes: { type: Number, required: false, default: 0 },
			downvotes: { type: Number, required: false, default: 0 },
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
			authorID: { type: String, index: true, required: true },
			questionID: { type: Number, required: true },
			title: { type: String, required: true },
			body: { type: [String], required: true },
			comments: { type: [commentModel], required: false, default: [] },
			answers: { type: [answerModel], required: false, default: [] },
			acceptedAnswer: { type: String, required: false, default: "" },
		},
		{ timestamps: true }
	)
);

export { commentModel, answerModel, questionModel };
