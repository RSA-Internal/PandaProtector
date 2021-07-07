import type { ApplicationCommandOptionType } from "discord.js";
import type { Snowflake } from "./core";

/**
 * TODO: Runtime Validation:
 * 1. Duplicate options in the same level.
 * 2. Length limit of 100 for `name`, `description`, and `value` fields.
 * 3. Ensure all optional fields are at the end.
 */

type SimpleCommandOptionType = Exclude<ApplicationCommandOptionType, "SUB_COMMAND" | "SUB_COMMAND_GROUP">;
type ComplexCommandOptionType = Exclude<ApplicationCommandOptionType, SimpleCommandOptionType>;

/** @see CommandOptionType */
export interface CommandOptionTypeMapping {
	/* eslint-disable @typescript-eslint/naming-convention */
	STRING: string;
	INTEGER: number;
	BOOLEAN: boolean;
	USER: Snowflake;
	CHANNEL: Snowflake;
	ROLE: Snowflake;
	MENTIONABLE: Snowflake;
	SUB_COMMAND: CommandOption<SimpleCommandOptionType>;
	SUB_COMMAND_GROUP: CommandOption<"SUB_COMMAND">;
	/* eslint-enable @typescript-eslint/naming-convention */
}

export type CommandOption<Type extends ApplicationCommandOptionType> = Type extends SimpleCommandOptionType
	? SimpleCommandOption<Type>
	: Type extends ComplexCommandOptionType
	? ComplexCommandOption<Type>
	: never;

// TODO: Omit `choices` from `SimpleCommandOption` for `"BOOLEAN"` type.
interface SimpleCommandOption<Type extends SimpleCommandOptionType> {
	readonly name: string;
	readonly description: string;
	readonly type: Type;
	readonly required?: boolean;
	readonly choices?: readonly CommandOptionChoice<Type>[];
}

interface ComplexCommandOption<Type extends ComplexCommandOptionType> {
	readonly name: string;
	readonly description: string;
	readonly type: Type;
	readonly options: readonly CommandOptionTypeMapping[Type][];
}

interface CommandOptionChoice<Type extends SimpleCommandOptionType> {
	readonly name: string;
	readonly value: CommandOptionTypeMapping[Type];
}

export interface Command<Options extends DefaultCommandOptions> {
	readonly descriptor: CommandDescriptor<Options>;
	readonly handlers: CommandHandlers<Options>;
}

export interface CommandDescriptor<Options extends DefaultCommandOptions> {
	readonly name: string;
	readonly description: string;
	readonly options: Options;
}

export type CommandHandlers<Options extends DefaultCommandOptions> =
	Options extends readonly CommandOption<SimpleCommandOptionType>[]
		? SimpleCommandHandler<Options>
		: Options extends readonly CommandOption<ComplexCommandOptionType>[]
		? ComplexCommandHandlers<Options>
		: never;

export interface SimpleCommandHandler<Options extends readonly CommandOption<SimpleCommandOptionType>[]> {
	readonly handler: (
		...args: {
			[K in keyof Options]: Options[K] extends CommandOption<SimpleCommandOptionType>
				?
						| (Options[K]["choices"] extends readonly CommandOptionChoice<SimpleCommandOptionType>[]
								? {
										[K2 in keyof Options[K]["choices"]]: Options[K]["choices"][K2] extends CommandOptionChoice<SimpleCommandOptionType>
											? Options[K]["choices"][K2]["value"]
											: never;
								  }[keyof Options[K]["choices"]]
								: CommandOptionTypeMapping[Options[K]["type"]])
						| (Options[K]["required"] extends true ? never : undefined)
				: never;
		}
	) => Promise<void>;
}

export type ComplexCommandHandlers<Options extends readonly CommandOption<ComplexCommandOptionType>[]> = {
	readonly [K in keyof Options & `${number}` as Extract<
		Options[K],
		Options[number]
	>["name"]]: Options[K] extends CommandOption<"SUB_COMMAND_GROUP">
		? ComplexCommandHandlers<Options[K]["options"]>
		: Options[K] extends CommandOption<"SUB_COMMAND">
		? SimpleCommandHandler<Options[K]["options"]>["handler"]
		: never;
};

export type DefaultCommandOptions =
	| readonly CommandOption<SimpleCommandOptionType>[]
	| readonly CommandOption<ComplexCommandOptionType>[];

export function makeCommand<Options extends DefaultCommandOptions>(
	descriptor: CommandDescriptor<Options>,
	handlers: CommandHandlers<Options>
): Command<Options> {
	return {
		descriptor,
		handlers,
	};
}
/*
const options = [
	{
		name: "user",
		description: "Sends a public message to a user.",
		type: "SUB_COMMAND",
		options: [
			{
				name: "user",
				description: "The user to send to.",
				type: "USER",
				required: true,
			},
			{
				name: "message",
				description: "The message to send.",
				type: "STRING",
				required: true,
			},
			{
				name: "severity",
				description: "The severity of the message, default is normal.",
				type: "STRING",
				required: false,
				choices: [
					{
						name: "Normal",
						value: "normal",
					},
					{
						name: "Severe",
						value: "severe",
					},
				],
			},
		],
	},
	{
		name: "role",
		description: "Sends a public message to a role.",
		type: "SUB_COMMAND",
		options: [
			{
				name: "role",
				description: "The role to send to.",
				type: "ROLE",
				required: true,
			},
			{
				name: "message",
				description: "The message to send.",
				type: "STRING",
				required: true,
			},
			{
				name: "severity",
				description: "The severity of the message, default is normal.",
				type: "STRING",
				required: false,
				choices: [
					{
						name: "Normal",
						value: "normal",
					},
					{
						name: "Severe",
						value: "severe",
					},
				],
			},
		],
	},
	{
		name: "dm",
		description: "Sends a direct message to a user or role.",
		type: "SUB_COMMAND_GROUP",
		options: [
			{
				name: "user",
				description: "Sends a public message to a user.",
				type: "SUB_COMMAND",
				options: [
					{
						name: "user",
						description: "The user to send to.",
						type: "USER",
						required: true,
					},
					{
						name: "message",
						description: "The message to send.",
						type: "STRING",
						required: true,
					},
					{
						name: "severity",
						description: "The severity of the message, default is normal.",
						type: "STRING",
						required: false,
						choices: [
							{
								name: "Normal",
								value: "normal",
							},
							{
								name: "Severe",
								value: "severe",
							},
						],
					},
				],
			},
			{
				name: "role",
				description: "Sends a public message to a role.",
				type: "SUB_COMMAND",
				options: [
					{
						name: "role",
						description: "The role to send to.",
						type: "ROLE",
						required: true,
					},
					{
						name: "message",
						description: "The message to send.",
						type: "STRING",
						required: true,
					},
					{
						name: "severity",
						description: "The severity of the message, default is normal.",
						type: "STRING",
						required: false,
						choices: [
							{
								name: "Normal",
								value: "normal",
							},
							{
								name: "Severe",
								value: "severe",
							},
						],
					},
				],
			},
		],
	},
] as const;

type u = CommandHandlers<typeof options>;
*/
