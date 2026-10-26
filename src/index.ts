import { tokenize, insertNodes } from "./utils";

class ChainElements {
	private elements: Element[];
	private enabled = true;

	constructor(elements: Element[]) {
		this.elements = elements;
	}

	getElements(): Element[] {
		return [...this.elements];
	}

	if(cond: boolean): this {
		this.enabled = cond;
		return this;
	}

	else(): this {
		this.enabled = !this.enabled;
		return this;
	}

	end(): this {
		this.enabled = true;
		return this;
	}

	tap(callback: (el: Element, index: number) => void): this {
		if (!this.enabled) return this;
		this.elements.forEach((el, i) => callback(el, i));
		return this;
	}

	addClass(...classNames: string[]): this {
		if (!this.enabled) return this;
		const tokens = tokenize(classNames);
		if (tokens.length > 0) {
			this.elements.forEach((el) => el.classList.add(...tokens));
		}
		return this;
	}

	removeClass(...classNames: string[]): this {
		if (!this.enabled) return this;
		const tokens = tokenize(classNames);
		if (tokens.length > 0) {
			this.elements.forEach((el) => el.classList.remove(...tokens));
		}
		return this;
	}

	toggleClass(className: string, force?: boolean): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => el.classList.toggle(className, force));
		return this;
	}

	setStyle(property: string, value: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => {
			if (el instanceof HTMLElement || el instanceof SVGElement) {
				el.style.setProperty(property, value);
			}
		});
		return this;
	}

	removeStyle(property: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => {
			if (el instanceof HTMLElement || el instanceof SVGElement) {
				el.style.removeProperty(property);
			}
		});
		return this;
	}

	setAttr(name: string, value: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => el.setAttribute(name, value));
		return this;
	}

	removeAttr(name: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => el.removeAttribute(name));
		return this;
	}

	html(htmlString: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => (el.innerHTML = htmlString));
		return this;
	}

	text(textString: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => (el.textContent = textString));
		return this;
	}

	val(value: string): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => {
			if (
				el instanceof HTMLInputElement ||
				el instanceof HTMLSelectElement ||
				el instanceof HTMLTextAreaElement ||
				el instanceof HTMLOptionElement ||
				el instanceof HTMLButtonElement
			) {
				el.value = value;
			}
		});
		return this;
	}

	append(...nodes: (string | Node)[]): this {
		if (!this.enabled) return this;
		insertNodes(this.elements, nodes, "append");
		return this;
	}

	prepend(...nodes: (string | Node)[]): this {
		if (!this.enabled) return this;
		insertNodes(this.elements, nodes, "prepend");
		return this;
	}

	before(...nodes: (string | Node)[]): this {
		if (!this.enabled) return this;
		insertNodes(this.elements, nodes, "before");
		return this;
	}

	after(...nodes: (string | Node)[]): this {
		if (!this.enabled) return this;
		insertNodes(this.elements, nodes, "after");
		return this;
	}

	remove(): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => el.remove());
		this.elements = [];
		return this;
	}

	empty(): this {
		if (!this.enabled) return this;
		this.elements.forEach((el) => (el.innerHTML = ""));
		return this;
	}
}

function id(id: string): ChainElements {
	const el = document.getElementById(id);
	return new ChainElements(el ? [el] : []);
}

function cls(className: string): ChainElements {
	const elements = Array.from(document.getElementsByClassName(className));
	return new ChainElements(elements);
}

function tag(tagName: string): ChainElements {
	const elements = Array.from(document.getElementsByTagName(tagName));
	return new ChainElements(elements);
}

function selOne(selector: string): ChainElements {
	const el = document.querySelector(selector);
	return new ChainElements(el ? [el] : []);
}

function selAll(selector: string): ChainElements {
	const elements = Array.from(document.querySelectorAll(selector));
	return new ChainElements(elements);
}

type ElementInput =
	| Element
	| Iterable<Element | null | undefined>
	| ArrayLike<Element | null | undefined>
	| null
	| undefined;

const isElement = (v: unknown): v is Element => v instanceof Element;

function toElements(input: ElementInput): Element[] {
	if (input == null) return [];
	if (input instanceof Element) return [input];
	return Array.from(input).filter(isElement);
}

function wrap(input: ElementInput): ChainElements {
	return new ChainElements(toElements(input));
}

const DomChainer = {
	id,
	cls,
	tag,
	selOne,
	selAll,
	wrap,
};

export { id, cls, tag, selOne, selAll, wrap };

export default DomChainer;
