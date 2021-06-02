interface Committer {
	name: string;
	email: string;
	date: string;
}

interface Tree {
	sha: string;
	url: string;
}

interface Verification {
	verified: boolean;
	reason: string;
	signature: string;
	payload: string;
}

export interface GithubUser {
	login: string;
	id: string;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: string;
}

interface Parent {
	sha: string;
	url: string;
	html_url: string;
}

interface CommitData {
	author: Committer;
	committer: Committer;
	message: string;
	tree: Tree;
	url: string;
	comment_count: number;
	verification: Verification;
}

interface RequiredChecks {
	enforcement_level: string;
	context: [];
}

export interface Repository {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: GithubUser;
	html_url: string;
	description: string | null;
	fork: boolean;
	url: string;
	forks_url: string;
	keys_url: string;
	collaborators_url: string;
	teams_url: string;
	hooks_url: string;
	issue_events_url: string;
	events_url: string;
	assignees_url: string;
	branches_url: string;
	tags_url: string;
	blobs_url: string;
	git_tags_url: string;
	git_refs_url: string;
	trees_url: string;
	statuses_url: string;
	languages_url: string;
	stargazers_url: string;
	contributors_url: string;
	subscribers_url: string;
	subscription_url: string;
	commits_url: string;
	git_commits_url: string;
	comments_url: string;
	issue_comment_url: string;
	contents_url: string;
	compare_url: string;
	merges_url: string;
	archive_url: string;
	downloads_url: string;
	issues_url: string;
	pulls_url: string;
	milestones_url: string;
	notifications_url: string;
	labels_url: string;
	releases_url: string;
	deployments_url: string;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	git_url: string;
	ssh_url: string;
	clone_url: string;
	svn_url: string;
	homepage: string | null;
	size: number;
	stargazers_count: number;
	watchers_count: number;
	language: string;
	has_issues: boolean;
	has_projects: boolean;
	has_downloads: boolean;
	has_wiki: boolean;
	has_pages: boolean;
	forks_count: number;
	mirror_url: string | null;
	archived: boolean;
	disabled: boolean;
	open_issues_count: number;
	license: string | null;
	forks: number;
	open_issues: number;
	watchers: number;
	default_branch: string;
	permissions: {
		admin: boolean;
		push: boolean;
		pull: boolean;
	};
	temp_clone_token: string;
	allow_squash_merge: boolean;
	allow_merge_commit: boolean;
	allow_rebase_merge: boolean;
	delete_branch_on_merge: boolean;
	organization: GithubUser;
	network_count: number;
	subscribers_count: number;
}

interface Head {
	label: string;
	ref: string;
	sha: string;
	user: GithubUser;
	repo: Repository;
}

export interface Label {
	id: number;
	node_id: string;
	url: string;
	name: string;
	color: string;
	default: boolean;
	description: string;
}

export interface GithubFile {
	sha: string;
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	changes: number;
	blob_url: string;
	raw_url: string;
	contents_url: string;
	patch: string;
}

export interface Branch {
	name: string;
	commit: Commit;
	_links: {
		self: string;
		html: string;
	};
	protected: boolean;
	protection: {
		enabled: boolean;
		required_status_checks: RequiredChecks;
	};
	protection_url: string;
}

export interface Commit {
	sha: string;
	node_id: string;
	commit: CommitData;
	url: string;
	html_url: string;
	comments_url: string;
	author: GithubUser;
	committer: GithubUser;
	parents: Parent[];
	stats: {
		total: number;
		additions: number;
		deletions: number;
	};
	files: GithubFile[];
}

export interface Issue {
	url: string;
	repository_url: string;
	labels_url: string;
	comments_url: string;
	events_url: string;
	html_url: string;
	id: number;
	node_id: string;
	number: number;
	title: string;
	user: GithubUser;
	labels: Label[];
	state: string;
	locked: boolean;
	assignee: GithubUser | null;
	assignees: GithubUser[];
	milestone: string | null;
	comments: number;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	author_association: string;
	active_lock_reason: string | null;
	body: string;
	closed_by: GithubUser | null;
	performed_via_github_app: boolean | null;
}

export interface PullRequest {
	url: string;
	id: number;
	node_id: string;
	html_url: string;
	diff_url: string;
	patch_url: string;
	issue_url: string;
	number: number;
	state: string;
	locked: boolean;
	title: string;
	user: GithubUser;
	body: string;
	created_at: string;
	updated_at: string;
	closed_at: string;
	merged_at: string;
	merge_commit_sha: string;
	assignee: GithubUser | null;
	assignees: GithubUser[];
	requested_reviewers: GithubUser[];
	requested_teams: [];
	labels: Label[];
	milestone: string | null;
	draft: boolean;
	commits_url: string;
	review_comments_url: string;
	review_comment_url: string;
	comments_url: string;
	statuses_url: string;
	head: Head;
	base: Head;
	_links: {
		self: { href: string };
		html: { href: string };
		issue: { href: string };
		comments: { href: string };
		review_comments: { href: string };
		review_comment: { href: string };
		commits: { href: string };
		statuses: { href: string };
	};
	author_association: string;
	auto_merge: boolean | null;
	active_lock_reason: string | null;
	merged: boolean;
	mergeable: boolean | null;
	rebaseable: boolean | null;
	mergeable_state: string;
	merged_by: GithubUser;
	comments: number;
	review_comments: number;
	maintainer_can_modify: boolean;
	commits: number;
	additions: number;
	deletions: number;
	changed_files: number;
}
