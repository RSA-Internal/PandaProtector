import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import type { Command } from "../command";
import { log } from "../logger";
import { getOauth } from "../store/githubOauth";
import { getState } from "../store/state";
import type { Branch, Commit, GithubUser, Issue, PullRequest, Repository } from "../types/github";

const command: Command = {
	name: "github",
	description: "Helper command for retrieving data for the guild specified repository.",
	options: [
		{
			type: "STRING",
			name: "name",
			description: "The type of item to fetch (branch, commit, issue, pullrequest)",
			required: true,
			choices: [
				{
					name: "Branch",
					value: "branches",
				},
				{
					name: "Commit",
					value: "commits",
				},
				{
					name: "Issue",
					value: "issues",
				},
				{
					name: "Pull Request",
					value: "pulls",
				},
				{
					name: "Respository",
					value: "repo",
				},
			],
		},
		{
			type: "STRING",
			name: "query",
			description: "The query to fetch. (REF for commits, pull-request number, etc)",
			required: true,
		},
		{
			type: "STRING",
			name: "repo",
			description: "A custom repository to fetch data from",
		},
	],
	hasPermission: () => true,
	shouldBeEphemeral: interaction =>
		interaction.channelID !== getState().config.botChannelId &&
		!(interaction.member as GuildMember).roles.cache.has(getState().config.developerRoleId),
	handler: (interaction, args) => {
		interaction.defer({ ephemeral: command.shouldBeEphemeral(interaction) }).catch(console.error.bind(console));

		const repo = (args.get("repo")?.value as string | undefined) ?? getState().config.ghRepoPath;
		const objectType = (args.get("name")?.value as string).toLowerCase();
		const query = args.get("query")?.value as string;
		const embedReply = new MessageEmbed();

		const route =
			objectType === "repo"
				? `https://api.github.com/repos/${query}`
				: `https://api.github.com/repos/${repo}/${objectType}/${query}`;

		oauthFetch(route)
			.then(json => {
				let jsonData = json as Branch | Commit | Issue | PullRequest | Repository;

				if (objectType === "issues" || objectType === "pulls") {
					const modifiedReply = handleIssueOrPr(repo, jsonData as Issue | PullRequest, embedReply);
					interaction.editReply(modifiedReply).catch(err => log(err, "error"));
					return;
				} else if (objectType === "commits") {
					const modifiedReply = handleCommit(jsonData as Commit, embedReply);
					interaction.editReply(modifiedReply).catch(err => log(err, "error"));
					return;
				} else if (objectType === "branches") {
					jsonData = jsonData as Branch;
					embedReply.setTitle(`${jsonData.name} in ${repo}`);
					embedReply.setThumbnail(jsonData.commit.author.avatar_url);
					embedReply.setURL(jsonData._links.html);
					embedReply.addField("Branch Name", `[${jsonData.name}](${jsonData._links.html})`, true);
					embedReply.addField(
						"Latest Commit",
						`[${jsonData.commit.sha.slice(0, 7)}](${jsonData.commit.html_url})`,
						true
					);
					embedReply.addField("Latest Commit Author", generateGitHubUserLink(jsonData.commit.author), true);
				} else if (objectType === "repo") {
					jsonData = jsonData as Repository;
					embedReply.setTitle(jsonData.name);
					embedReply.setDescription(jsonData.full_name);
					embedReply.setURL(jsonData.html_url);
					embedReply.addField("Owner", generateGitHubUserLink(jsonData.owner), true);
					embedReply.addField("Language", jsonData.language, true);
					embedReply.addField("Creation Date", jsonData.created_at, true);
					embedReply.addField("Is a fork", String(jsonData.fork), true);
					embedReply.addField("Open Issues", String(jsonData.open_issues_count), true);
					embedReply.addField("Watchers", String(jsonData.watchers_count), true);
					embedReply.addField("Description", jsonData.description ?? "No description set.");
				}

				interaction.editReply(embedReply).catch(err => log(err, "error"));
			})
			.catch(res => handleError(interaction, res as string));
	},
};

export default command;

function handleCommit(jsonData: Commit, embedReply: MessageEmbed): MessageEmbed {
	embedReply.setURL(jsonData.html_url);
	embedReply.setThumbnail(jsonData.author.avatar_url);
	embedReply.setTitle(`commit: ${jsonData.sha}`);
	embedReply.addField("Author", generateGitHubUserLink(jsonData.author), true);
	embedReply.addField(
		"Stats",
		`Total: ${jsonData.stats.total}\nAdditions: ${jsonData.stats.additions}\nDeletions: ${jsonData.stats.deletions}`,
		true
	);
	embedReply.addField("Signed", String(jsonData.commit.verification.verified), true);
	embedReply.addField("Message", jsonData.commit.message, false);

	const fileCount = jsonData.files.length;
	let filePadding = 0;
	let diffPadding = 0;

	jsonData.files.forEach(file => {
		filePadding = Math.max(filePadding, file.filename.length);
		diffPadding = Math.max(diffPadding, Math.floor(Math.log10(file.additions || 1)));
	});

	if (fileCount > 0) {
		const count = 0;
		const lines: string[] = [];

		for (let count = 0; count < Math.min(5, fileCount); count++) {
			const file = jsonData.files[count];

			lines.push(
				`[${file.status.slice(0, 1).toUpperCase()}] ${file.filename}: ${" ".repeat(
					filePadding - file.filename.length
				)} +${file.additions}${" ".repeat(diffPadding - Math.floor(Math.log10(file.additions || 1)))} | -${
					file.deletions
				}`
			);
		}

		if (fileCount > count) lines.push(`...and ${fileCount - count} more.`);

		embedReply.addField("Files", `\`\`\`${lines.join("\n")}\n\`\`\``, false);
	}

	return embedReply;
}

function handleIssueOrPr(repo: string, jsonData: Issue | PullRequest, embedReply: MessageEmbed): MessageEmbed {
	if (jsonData.labels.length > 0) {
		const labelList = jsonData.labels.map(label => label.name);
		embedReply.setDescription(labelList.join(", "));
	}

	embedReply.setTitle(`[${jsonData.state}] #${jsonData.number} ${jsonData.title}`);
	embedReply.setThumbnail(jsonData.user.avatar_url);
	embedReply.setURL(jsonData.html_url);
	embedReply.addField("Author", generateGitHubUserLink(jsonData.user), true);
	embedReply.addField("Association", jsonData.author_association, true);

	if (jsonData.assignees?.length > 0) {
		const assignees = jsonData.assignees.map(generateGitHubUserLink);
		embedReply.addField("Assignees", assignees.join("\n"), true);
	}

	embedReply.addField("Body", hyperlinkComments(repo, jsonData.body), false);

	return embedReply;
}

function hyperlinkComments(repo: string, body: string): string {
	const newBody = body.replace(/(\(\S{7}\))+/g, match => {
		return `[${match}](https://github.com/${repo}/commit/${match.slice(1, match.length - 1)})`;
	});

	return `${newBody.slice(0, 800)}${newBody.length > 800 ? "\n...and more!" : ""}`;
}

function generateGitHubUserLink(user: GithubUser): string {
	return `[${user.login}](${user.html_url})`;
}

function oauthFetch(url: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const oauth = getOauth();
		const header = { Authorization: oauth ? `token ${oauth}` : "" };

		fetch(url, {
			headers: header,
		})
			.then(res => res.json())
			.then(json => {
				const res = json as { message: string; documentation_url: string };

				if (res.message) {
					if (res.message.includes("rate limit")) {
						reject(
							oauth
								? "Rate limit reached!"
								: "[No Oauth] Rate limit reached! If you are seeing this error, ask the bot host to set the `ghOauth` field within the secrets file."
						);
					} else {
						reject(res.message);
					}
				} else {
					resolve(json);
				}
			})
			.catch(console.error.bind(console));
	});
}

function handleError(interaction: CommandInteraction, res: string): void {
	interaction.editReply(`Failed to handle request: ${res}.`).catch(console.error.bind(console));
}
