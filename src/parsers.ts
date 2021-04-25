/**
 * Splits a string using whitespace as the delimiter. Quote-wrapped substrings are treated as a single argument
 * regardless of any whitespace. Additionally, quotes and whitespace can be escaped by prefixing it with a backslash.
 */
export function defaultArgumentParser(content: string): string[] {
	const phrases = new Array<string>();
	let substring = "";
	let inQuotes = false;

	for (let i = 0; i < content.length; i++) {
		if (content[i] === '"') {
			inQuotes = !inQuotes;
		} else if (/\s/.test(content[i]) && !inQuotes) {
			// next argument
			if (substring.length > 0) {
				// ignore empty arguments
				phrases.push(substring);
			}

			substring = "";
		} else if (content[i] === "\\") {
			// handle escape
			substring += content[i + 1] || "\\";
			i += 1;
		} else {
			substring += content[i];
		}
	}

	if (substring.length > 0) {
		phrases.push(substring);
	}

	return phrases;
}
