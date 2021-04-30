import type { InsertOneWriteOpResult, WithId } from "mongodb";
import type { State } from "../state";

export interface CmdHistory {
	readonly discordId: string;
	readonly timestamp: number;
	readonly command: string;
	readonly arguments: readonly string[];
}

export async function insertCmdHistory(
	state: State,
	entry: CmdHistory
): Promise<InsertOneWriteOpResult<WithId<CmdHistory>>> {
	return state.mongoClient.db().collection<CmdHistory>("cmdHistory").insertOne(entry);
}
