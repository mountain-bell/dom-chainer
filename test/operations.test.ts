import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { selAll, wrap } from "../src/index";

beforeEach(() => {
	document.body.innerHTML =
		'<div class="item keep"><b>old</b></div><div class="item keep"><b>old</b></div>';
});
afterEach(() => document.body.replaceChildren());

describe("classの操作", () => {
	it.each(["", "two classes"])(
		"toggleClassに単一のclass名でない値「%s」を渡すとDOMExceptionを投げる",
		(className) => {
			expect(() => selAll(".item").toggleClass(className)).toThrow(
				DOMException
			);
		}
	);
	it("addClassは複数引数とHTMLの空白文字を区切りとして全要素に追加する", () => {
		const chain = selAll(".item").addClass(
			"one two\tthree",
			"four\nfive\rsix\fseven",
			"one"
		);
		for (const el of chain.getElements()) {
			expect(Array.from(el.classList)).toEqual([
				"item",
				"keep",
				"one",
				"two",
				"three",
				"four",
				"five",
				"six",
				"seven",
			]);
		}
	});
	it("removeClassは複数引数と空白区切りで指定したclassだけを全要素から削除する", () => {
		const chain = selAll(".item")
			.addClass("one two three four five")
			.removeClass("item\tone\ntwo", "three\rfour\ffive");
		expect(chain.getElements().map((el) => el.className)).toEqual([
			"keep",
			"keep",
		]);
	});
	it("空のclass指定では既存のclassを変更しない", () => {
		const chain = selAll(".item")
			.addClass()
			.addClass(" \t\n\r\f")
			.removeClass()
			.removeClass("");
		expect(chain.getElements().map((el) => el.className)).toEqual([
			"item keep",
			"item keep",
		]);
	});
	it("カンマと非改行スペースはclass名の一部として扱う", () => {
		const chain = selAll(".item").addClass("one,two", "three\u00a0four");
		for (const el of chain.getElements()) {
			expect(el.classList.contains("one,two")).toBe(true);
			expect(el.classList.contains("three\u00a0four")).toBe(true);
			expect(el.classList.contains("one")).toBe(false);
		}
	});
	it("toggleClassは各要素の現在の状態を反転する", () => {
		const elements = selAll(".item").getElements();
		elements[0].classList.add("active");
		wrap(elements).toggleClass("active");
		expect(elements.map((el) => el.classList.contains("active"))).toEqual([
			false,
			true,
		]);
	});
	it.each([true, false])(
		"toggleClassにforce=%sを指定すると繰り返してもその状態に揃う",
		(force) => {
			document.querySelector(".item")!.classList.add("active");
			const chain = selAll(".item")
				.toggleClass("active", force)
				.toggleClass("active", force);
			expect(
				chain.getElements().map((el) => el.classList.contains("active"))
			).toEqual([force, force]);
		}
	);
});

describe("属性とスタイルの操作", () => {
	it("setAttrとremoveAttrは全要素の指定属性だけを変更する", () => {
		const chain = selAll(".item").setAttr("data-state", "ready");
		expect(
			chain.getElements().map((el) => el.getAttribute("data-state"))
		).toEqual(["ready", "ready"]);
		chain.removeAttr("data-state");
		for (const el of chain.getElements()) {
			expect(el.hasAttribute("data-state")).toBe(false);
			expect(el.className).toBe("item keep");
		}
	});
	it("HTMLとSVGのインラインスタイルを設定・削除できる", () => {
		const elements = [
			document.createElement("div"),
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
		];
		const chain = wrap(elements)
			.setStyle("color", "red")
			.setStyle("--size", "2px");
		for (const el of elements) {
			expect(el.style.getPropertyValue("color")).toBe("red");
			expect(el.style.getPropertyValue("--size")).toBe("2px");
		}
		chain.removeStyle("color");
		for (const el of elements) {
			expect(el.style.getPropertyValue("color")).toBe("");
			expect(el.style.getPropertyValue("--size")).toBe("2px");
		}
	});
});

describe("内容とフォーム値の操作", () => {
	it("htmlは全要素の内容を指定したHTMLに置き換える", () => {
		const chain = selAll(".item").html("<em>new</em>");
		expect(chain.getElements().map((el) => el.innerHTML)).toEqual([
			"<em>new</em>",
			"<em>new</em>",
		]);
	});
	it("textはHTMLとして解釈せず全要素の内容を文字列に置き換える", () => {
		const chain = selAll(".item").text("<em>new</em>");
		for (const el of chain.getElements()) {
			expect(el.textContent).toBe("<em>new</em>");
			expect(el.children).toHaveLength(0);
		}
	});
	it.each(["input", "textarea", "select", "option", "button"] as const)(
		"valは複数の%sの値を設定でき、空文字で消去できる",
		(tag) => {
			const elements = [
				document.createElement(tag),
				document.createElement(tag),
			];
			if (tag === "select") {
				for (const el of elements)
					el.innerHTML =
						'<option value="">empty</option><option value="new">new</option>';
			}
			const chain = wrap(elements).val("new");
			expect(elements.map((el) => el.value)).toEqual(["new", "new"]);
			chain.val("");
			expect(elements.map((el) => el.value)).toEqual(["", ""]);
		}
	);
	it("valはフォーム要素以外の内容を変更しない", () => {
		const chain = selAll(".item").val("new");
		expect(chain.getElements().map((el) => el.innerHTML)).toEqual([
			"<b>old</b>",
			"<b>old</b>",
		]);
	});
	it("emptyは対象要素と属性を残して子ノードだけを削除する", () => {
		const chain = selAll(".item").empty();
		expect(document.querySelectorAll(".item")).toHaveLength(2);
		for (const el of chain.getElements())
			expect(el.childNodes).toHaveLength(0);
	});
	it("removeは対象要素をDOMから削除し、以後の操作対象も空にする", () => {
		const chain = selAll(".item");
		const elements = [...chain.getElements()];
		chain.remove().addClass("removed");
		expect(document.body.children).toHaveLength(0);
		expect(chain.getElements()).toEqual([]);
		for (const el of elements)
			expect(el.classList.contains("removed")).toBe(false);
	});
});
