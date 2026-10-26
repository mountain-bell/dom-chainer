import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { selAll, wrap } from "../src/index";

beforeEach(() => {
	document.body.innerHTML =
		'<section><div class="target">old</div></section><section><div class="target">old</div></section>';
});
afterEach(() => document.body.replaceChildren());

const insertions = [
	[
		"append",
		'<div class="target">old&lt;b&gt;text&lt;/b&gt;<span><b>node</b></span>tail</div>',
	],
	[
		"prepend",
		'<div class="target">&lt;b&gt;text&lt;/b&gt;<span><b>node</b></span>tailold</div>',
	],
	[
		"before",
		'&lt;b&gt;text&lt;/b&gt;<span><b>node</b></span>tail<div class="target">old</div>',
	],
	[
		"after",
		'<div class="target">old</div>&lt;b&gt;text&lt;/b&gt;<span><b>node</b></span>tail',
	],
] as const;

describe("Nodeと文字列の挿入", () => {
	it.each(insertions)(
		"対象が空なら%sに渡したFragmentを消費しない",
		(method) => {
			const fragment = document.createDocumentFragment();
			const child = document.createElement("span");
			fragment.append(child);
			wrap(null)[method](fragment);
			expect(fragment.firstChild).toBe(child);
		}
	);
	it.each(insertions)(
		"%sは全対象の指定位置に引数順で挿入し、文字列をHTMLとして解釈しない",
		(method, expected) => {
			const node = document.createElement("span");
			node.innerHTML = "<b>node</b>";
			selAll(".target")[method]("<b>text</b>", node, "tail");
			expect(
				Array.from(
					document.querySelectorAll("section"),
					(el) => el.innerHTML
				)
			).toEqual([expected, expected]);
			const inserted = document.querySelectorAll("span");
			expect(inserted[0]).toBe(node);
			expect(inserted[1]).not.toBe(node);
			expect(inserted[1].firstChild).not.toBe(node.firstChild);
		}
	);

	it.each(insertions)(
		"%sはDocumentFragmentの内容を全対象に挿入する",
		(method) => {
			// 最初の挿入でFragmentが空になっても、後続の対象に内容が届くことを確認する。
			const fragment = document.createDocumentFragment();
			const child = document.createElement("em");
			child.textContent = "fragment";
			fragment.append(child, "tail");
			selAll(".target")[method](fragment);
			const sections = document.querySelectorAll("section");
			for (const section of sections) {
				expect(section.querySelector("em")?.textContent).toBe(
					"fragment"
				);
				expect(section.textContent).toContain("fragmenttail");
			}
			expect(sections[0].querySelector("em")).toBe(child);
			expect(sections[1].querySelector("em")).not.toBe(child);
			expect(fragment.childNodes).toHaveLength(0);
		}
	);

	it.each(insertions)(
		"%sは単一対象には既存のNodeを複製せず移動する",
		(method) => {
			const node = document.createElement("span");
			document.body.append(node);
			const target = document.querySelector(".target")!;
			wrap(target)[method](node);
			expect(document.querySelector("section span")).toBe(node);
			expect(document.querySelectorAll("span")).toHaveLength(1);
		}
	);

	it.each(insertions)("%sを引数なしで呼ぶと内容を変更しない", (method) => {
		const before = document.body.innerHTML;
		selAll(".target")[method]();
		expect(document.body.innerHTML).toBe(before);
	});
});
