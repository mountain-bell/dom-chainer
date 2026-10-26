import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { selAll, wrap } from "../src/index";

beforeEach(() => {
	document.body.innerHTML =
		'<div class="item keep" data-keep="yes" style="color: red"><b>old</b></div><div class="item keep" data-keep="yes" style="color: red"><b>old</b></div>';
});
afterEach(() => document.body.replaceChildren());

type Chain = ReturnType<typeof wrap>;
const operations: [string, (chain: Chain) => Chain][] = [
	["addClass", (chain) => chain.addClass("new")],
	["removeClass", (chain) => chain.removeClass("keep")],
	["toggleClass", (chain) => chain.toggleClass("keep")],
	["setStyle", (chain) => chain.setStyle("color", "blue")],
	["removeStyle", (chain) => chain.removeStyle("color")],
	["setAttr", (chain) => chain.setAttr("data-keep", "no")],
	["removeAttr", (chain) => chain.removeAttr("data-keep")],
	["html", (chain) => chain.html("<i>new</i>")],
	["text", (chain) => chain.text("new")],
	["val", (chain) => chain.val("new")],
	["append", (chain) => chain.append("new")],
	["prepend", (chain) => chain.prepend("new")],
	["before", (chain) => chain.before("new")],
	["after", (chain) => chain.after("new")],
	["remove", (chain) => chain.remove()],
	["empty", (chain) => chain.empty()],
	[
		"tap",
		(chain) =>
			chain.tap((el) => {
				el.textContent = "new";
			}),
	],
];

describe("メソッドチェーンの共通仕様", () => {
	it.each(operations)("%sは同じチェーンを返す", (_, operate) => {
		const chain = selAll(".item");
		expect(operate(chain)).toBe(chain);
	});
	it.each(operations)("対象が空でも%sを呼び出せる", (_, operate) => {
		const chain = wrap(null);
		expect(operate(chain)).toBe(chain);
		expect(chain.getElements()).toEqual([]);
	});
	it.each(operations)(
		"if(false)の後では%sを実行せず、対象も保持する",
		(_, operate) => {
			document.body.insertAdjacentHTML(
				"beforeend",
				'<input class="item" value="old">'
			);
			const chain = selAll(".item");
			const elements = [...chain.getElements()];
			const before = document.body.innerHTML;
			expect(operate(chain.if(false))).toBe(chain);
			expect(document.body.innerHTML).toBe(before);
			expect(document.querySelector("input")?.value).toBe("old");
			expect(chain.getElements()).toEqual(elements);
		}
	);
});

describe("if・else・end", () => {
	it.each([true, false])(
		"if(%s)とelseは片方の操作だけを実行し、end後は実行を再開する",
		(condition) => {
			const chain = selAll(".item");
			expect(chain.if(condition)).toBe(chain);
			chain.setAttr("data-branch", "if");
			expect(chain.else()).toBe(chain);
			chain.setAttr("data-branch", "else");
			expect(chain.end()).toBe(chain);
			chain.addClass("done");
			for (const el of chain.getElements()) {
				expect(el.getAttribute("data-branch")).toBe(
					condition ? "if" : "else"
				);
				expect(el.classList.contains("done")).toBe(true);
			}
		}
	);
	it("次のifは前の条件を引き継がず切り替え、endは無条件で実行を再開する", () => {
		const chain = selAll(".item")
			.if(false)
			.if(true)
			.addClass("inner")
			.end()
			.addClass("resumed");
		for (const el of chain.getElements()) {
			expect(el.classList.contains("inner")).toBe(true);
			expect(el.classList.contains("resumed")).toBe(true);
		}
	});
});

describe("tap", () => {
	it("各要素と0始まりのindexを順番に渡し、その後も同じ対象でチェーンを続ける", () => {
		const chain = selAll(".item");
		const visits: [Element, number][] = [];
		chain
			.tap((el, index) => {
				visits.push([el, index]);
				el.textContent = String(index);
			})
			.addClass("done");
		const elements = chain.getElements();
		expect(visits).toEqual([
			[elements[0], 0],
			[elements[1], 1],
		]);
		expect(elements.map((el) => el.textContent)).toEqual(["0", "1"]);
		for (const el of elements)
			expect(el.classList.contains("done")).toBe(true);
	});
	it("無効な条件中と空の対象ではコールバックを実行しない", () => {
		const callback = () => {
			throw new Error("呼ばれないはずのコールバック");
		};
		expect(() => selAll(".item").if(false).tap(callback)).not.toThrow();
		expect(() => wrap(null).tap(callback)).not.toThrow();
	});
});
