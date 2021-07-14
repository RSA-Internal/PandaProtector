import type { ApplicationCommandPermissionData } from "discord.js";

interface PermissionTree {
	[key: string]: PermissionObject;
}

interface PermissionObject {
	field: string;
	perms: ApplicationCommandPermissionData[];
}

export function getPermissions(commandName: string): PermissionObject {
	return permissions[commandName];
}

const permissions: PermissionTree = {
	cmdhistory: {
		field: "staffRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	compile: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	compilers: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	config: {
		field: "developerRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	debug: {
		field: "developerRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	github: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	help: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	permissions: {
		field: "staffRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	ping: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	report: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	role: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	serverinfo: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	update: {
		field: "developerRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
	uptime: {
		field: "memberRoleId",
		perms: [
			{
				id: "0",
				type: "ROLE",
				permission: true,
			},
		],
	},
};
