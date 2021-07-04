import type { ApplicationCommandPermissionData } from "discord.js";
import type { State } from "../state";

interface PermissionTree {
	[key: string]: PermissionObject;
}

interface PermissionObject {
	field: string;
	perms: ApplicationCommandPermissionData[];
}

let state: State | undefined;

export function setPermState(newState: State): void {
	state = newState;
}

function getState() {
	return state;
}

export function getPermissions(commandName: string): PermissionObject {
	return permissions[commandName];
}

const permissions: PermissionTree = {
	cmdhistory: {
		field: "staffRoleId",
		perms: [
			{
				id: getState()?.config.staffRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	compile: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	compilers: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	config: {
		field: "developerRoleId",
		perms: [
			{
				id: getState()?.config.developerRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	debug: {
		field: "developerRoleId",
		perms: [
			{
				id: getState()?.config.developerRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	github: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	help: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	ping: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	report: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	serverinfo: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	update: {
		field: "developerRoleId",
		perms: [
			{
				id: getState()?.config.developerRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	uptime: {
		field: "memberRoleId",
		perms: [
			{
				id: getState()?.config.memberRoleId ?? "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
};
