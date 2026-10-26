export function tokenize(classNames: string[]): string[] {
	const tokens: string[] = [];
	for (const cn of classNames) {
		const parts = cn.match(/[^\x20\t\r\n\f]+/g);
		if (parts) {
			for (const part of parts) tokens.push(part);
		}
	}
	return tokens;
}

export function insertNodes(
	elements: Element[],
	nodes: (string | Node)[],
	method: "append" | "prepend" | "before" | "after"
): void {
	const contents = elements.map((_, i) =>
		i > 0
			? nodes.map((n) => (n instanceof Node ? n.cloneNode(true) : n))
			: nodes
	);
	elements.forEach((el, i) => {
		el[method](...contents[i]);
	});
}
