import { afterEach, beforeEach, describe, expect, it } from "vitest";
import DomChainer, { id, cls, tag, selOne, selAll, wrap } from "../src/index";

beforeEach(() => {
	document.body.innerHTML =
		'<div id="first" class="item"></div><div id="second" class="item"></div><p id="other"></p>';
});
afterEach(() => document.body.replaceChildren());

describe("要素の選択", () => {
	it.each([
		["selOne", () => selOne("[")],
		["selAll", () => selAll("[")],
	] as const)(
		"%sに不正なCSSセレクタを渡すとSyntaxErrorを投げる",
		(_, select) => {
			expect(select).toThrow(
				expect.objectContaining({ name: "SyntaxError" })
			);
		}
	);
	it("getElementsで返された配列から要素を除いても、元のチェーンの操作対象は変わらない", () => {
		const chain = selAll(".item");
		const elements = chain.getElements();
		elements.pop();
		chain.addClass("selected");
		expect(elements).toHaveLength(1);
		expect(document.getElementById("first")?.className).toBe(
			"item selected"
		);
		expect(document.getElementById("second")?.className).toBe(
			"item selected"
		);
	});
	it("取得した配列のDOM要素を変更すると、実際のDOMとチェーンが参照する同じ要素に反映される", () => {
		const chain = selAll(".item");
		const elements = chain.getElements();
		elements[0].textContent = "更新";
		expect(document.getElementById("first")?.textContent).toBe("更新");
		expect(chain.getElements()[0]).toBe(elements[0]);
	});
	it.each([
		["id", () => id("second"), ["second"]],
		["cls", () => cls("item"), ["first", "second"]],
		["tag", () => tag("div"), ["first", "second"]],
		["selOne", () => selOne(".item"), ["first"]],
		["selAll", () => selAll(".item"), ["first", "second"]],
	] as const)("%sは一致する要素をDOM順で返す", (_, select, expected) => {
		expect(
			select()
				.getElements()
				.map((el) => el.id)
		).toEqual(expected);
	});

	it.each([
		["id", () => id("missing")],
		["cls", () => cls("missing")],
		["tag", () => tag("article")],
		["selOne", () => selOne(".missing")],
		["selAll", () => selAll(".missing")],
	] as const)("%sに一致する要素がなければ空のチェーンを返す", (_, select) => {
		expect(select().getElements()).toEqual([]);
	});

	it.each([
		["cls", () => cls("item")],
		["tag", () => tag("div")],
		["selAll", () => selAll(".item")],
	] as const)(
		"%sで選択した後にDOMを変更しても、操作対象は変わらない",
		(_, select) => {
			const chain = select();
			document.body.insertAdjacentHTML(
				"beforeend",
				'<div id="later" class="item"></div>'
			);
			chain.removeClass("item").setAttr("data-selected", "yes");
			expect(
				Array.from(
					document.querySelectorAll("[data-selected]"),
					(el) => el.id
				)
			).toEqual(["first", "second"]);
			expect(document.getElementById("later")?.className).toBe("item");
		}
	);

	it("default exportとnamed exportで同じAPIを利用できる", () => {
		expect(DomChainer).toEqual({ id, cls, tag, selOne, selAll, wrap });
	});
});

describe("wrap", () => {
	it("渡した配列を後から変更しても、取り込んだ操作対象は変わらない", () => {
		const input = Array.from(document.querySelectorAll(".item"));
		const chain = wrap(input);
		input.pop();
		chain.addClass("selected");
		expect(
			Array.from(document.querySelectorAll(".selected"), (el) => el.id)
		).toEqual(["first", "second"]);
	});
	it("単一のElementをそのまま操作対象にする", () => {
		const element = document.createElement("div");
		expect(wrap(element).getElements()).toEqual([element]);
	});

	it.each([
		["NodeList", () => document.querySelectorAll(".item")],
		["HTMLCollection", () => document.getElementsByClassName("item")],
		[
			"配列",
			() => [
				document.getElementById("first"),
				null,
				undefined,
				document.getElementById("second"),
			],
		],
		["Iterable", () => new Set(document.querySelectorAll(".item"))],
		[
			"ArrayLike",
			() => ({
				0: document.getElementById("first"),
				1: document.getElementById("second"),
				length: 2,
			}),
		],
	] as const)(
		"%sの要素を順番に取り込み、nullとundefinedは除く",
		(_, input) => {
			expect(
				wrap(input())
					.getElements()
					.map((el) => el.id)
			).toEqual(["first", "second"]);
		}
	);

	it.each([null, undefined, []])("%sを渡すと空のチェーンを返す", (input) => {
		expect(wrap(input).getElements()).toEqual([]);
	});
});
