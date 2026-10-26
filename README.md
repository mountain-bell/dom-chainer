# DomChainer

DomChainerは、DOM要素の選択と操作をメソッドチェーンで記述するユーティリティです。

フレームワークを使わないサイトで、複数のDOM操作や条件分岐をまとめたい場合に使えます。

---

## ✨ 特徴

- **選択した要素への操作をチェーンにまとめる**：クラス・属性・スタイルなどの変更を、対象を繰り返し指定せずに記述できます。
- **単一要素も複数要素も同じ操作方法**：複数要素への一括操作も、呼び出し側でループを書く必要がありません。
- **条件付きの操作もチェーン内に記述**：`.if()` / `.else()` / `.end()`で、一部の操作だけを条件に応じて切り替えられます。

---

## 🧩 インストール

```bash
npm install @mountain-bell/dom-chainer
```

ブラウザのDOM環境を必要とします。ブラウザごとの最低対応バージョンは定めていません。

ESM・CommonJS・TypeScriptに対応しています。

---

## 🚀 基本の使い方

### 1. 要素を選択して操作する

次のHTMLを用意し、その要素がDOMに追加された後（DOMContentLoaded後など）にコードを実行します。コードはnpmのimportを解決できるバンドラーなどでブラウザ用にビルドしてください。

```html
<p id="message"></p>
```

```ts
import DomChainer from "@mountain-bell/dom-chainer";

DomChainer.selOne("#message")
	.text("Hello, World!")
	.addClass("is-visible")
	.setStyle("color", "blue");
```

実行後、段落に`Hello, World!`と表示され、`is-visible`クラスと青い文字色が設定されます。

以下の応用例は、この例と同じ`DomChainer`のimportと、操作対象のHTMLが用意されている前提です。

`selOne()`は最初に見つかった1要素をラップします。対象が見つからない場合でもエラーにはならず、空のチェーンとして扱われます。

### 2. 複数要素をまとめて操作する

```ts
DomChainer.selAll(".item")
	.addClass("is-active")
	.setAttr("data-ready", "true")
	.text("更新済み");
```

`selAll()`は該当するすべての要素に同じ操作を適用します。

操作対象は、`selAll()`を呼んだ時点で取得した要素です。後から条件に一致する要素がDOMに追加されても、同じチェーンの操作対象には加わりません。追加した要素も操作したい場合は、もう一度`selAll()`で取得してください。

### 3. ID・クラス名・タグ名から選ぶ

```ts
DomChainer.id("header").addClass("is-fixed");
DomChainer.cls("button").addClass("is-enabled");
DomChainer.tag("section").removeClass("is-hidden");
```

それぞれ`document.getElementById()`・`document.getElementsByClassName()`・`document.getElementsByTagName()`を使って要素を取得します。

### 4. 既存のDOM要素をラップする

```ts
const element = document.querySelector(".container");

DomChainer.wrap(element)
	.addClass("is-mounted")
	.append(document.createElement("span"));
```

`wrap()`には単一の`Element`、`NodeList`、`HTMLCollection`、配列、`Set`などのIterable、ArrayLike、`null`、`undefined`を渡せます。コレクション内の`null`・`undefined`は除外し、残った要素の順序を保ちます。入力自体が`null`や`undefined`なら空のチェーンになります。

---

## 読み込み方法

基本例のdefault importに加えて、named importとCommonJSを利用できます。

### named importで使う

```ts
import { selOne } from "@mountain-bell/dom-chainer";
selOne("#message").text("Hello, World!");
```

### CommonJSで使う

```js
const { selOne } = require("@mountain-bell/dom-chainer");
// DOM環境で実行するコードです。
selOne("#message").text("Hello, World!");
```

### scriptタグで使う

単独の`<script>`用ファイルはnpm配布物に含まれません。

[GitHubのbrowser/dom-chainer.js](https://github.com/mountain-bell/dom-chainer/blob/main/browser/dom-chainer.js)をダウンロードして配置すると、ビルド環境なしで使えます。GitHubのファイル表示ページのURLを直接scriptのsrcに指定せず、取得したJSファイルを指定してください。

```html
<p id="message"></p>
<script src="./dom-chainer.js"></script>
<script>
	DomChainer.id("message").text("Hello, World!");
</script>
```

グローバル変数`DomChainer`から同じAPIを利用できます。ソースマップも使う場合は、同じ場所に`dom-chainer.js.map`を配置します。

---

## 🔀 チェーン内の条件分岐

DomChainerでは`.if()` / `.else()` / `.end()`を使って、チェーンを途中だけ有効または無効にできます。

```ts
const isOpen = true;

DomChainer.id("menu")
	.if(isOpen)
	.addClass("is-open")
	.else()
	.removeClass("is-open")
	.end()
	.setAttr("aria-hidden", String(!isOpen));
```

- `.if(cond)`は、以降の操作を実行するかどうかを条件で切り替えます。
- `.else()`は有効 / 無効を反転します。
- `.end()`で通常の実行状態に戻ります。

次の`.if()`を呼ぶと、それまでの条件を新しい条件に切り替えます。条件を入れ子として保持することはありません。前の条件で操作を続けたい場合は、もう一度その条件を指定します。

```ts
const isLoggedIn = true;
const canEdit = false;

DomChainer.id("menu")
	.if(isLoggedIn)
	.addClass("is-visible")
	.if(isLoggedIn && canEdit)
	.addClass("is-editable")
	.if(isLoggedIn)
	.addClass("is-ready")
	.end();
```

`.if()`は操作の実行を切り替えるメソッドです。引数の評価は止めず、TypeScriptの型を絞り込むこともありません。例えば`.if(user !== null).text(user.name)`は、`user`がnullでも`user.name`を評価してしまいます。

null判定が必要な処理は、`.tap()`の中で通常の`if`文を使ってください。

```ts
function showName(user: { name: string } | null) {
	DomChainer.id("name").tap((el) => {
		if (user !== null) {
			el.textContent = user.name;
		}
	});
}

showName({ name: "山田" });
```

---

## 📝 Nodeの追加について

`append()` / `prepend()` / `before()` / `after()`は、文字列または`Node`を複数渡せます。

```ts
const badge = document.createElement("span");
badge.textContent = "NEW";

DomChainer.selAll(".card").append(" ", badge);
```

複数要素に同じ`Node`を追加する場合、2要素目以降には`cloneNode(true)`されたNodeが使われます。

文字列はHTMLとして解析されず、テキストとして挿入されます。既存のNodeは最初の対象へ移動し、複製には`addEventListener()`で登録したリスナーは引き継がれません。

---

## 🛠️ API

以下の選択関数は、named exportと`DomChainer`のメソッドの両方で使えます。`wrap()`以外は`document`全体から要素を選択します。

### `DomChainer.id(id)`

指定したIDの要素をラップします。

### `DomChainer.cls(className)`

指定したクラス名を持つすべての要素をラップします。

### `DomChainer.tag(tagName)`

指定したタグ名のすべての要素をラップします。

### `DomChainer.selOne(selector)`

CSSセレクタに一致する最初の要素をラップします。

### `DomChainer.selAll(selector)`

CSSセレクタに一致するすべての要素をラップします。

### `DomChainer.wrap(input)`

既存の`Element`、`Iterable<Element | null | undefined>`、`ArrayLike<Element | null | undefined>`をラップします。コレクション内の`null`・`undefined`は除外します。入力自体が`null` / `undefined`なら空のチェーンとして扱います。

---

## 📜 メソッド一覧

`getElements()`以外のメソッドは、続けて別のメソッドを呼び出せます。

| メソッド                          | 説明                                                                                                                                                                                   |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.getElements()`                  | 操作対象のDOM要素を配列で返します。配列への追加・削除はチェーンの操作対象に影響しません。配列内のDOM要素を変更すると、実際のDOMに反映されます。`.if(false)`の後でも取得できます。      |
| `.if(cond)`                       | `true`なら以降の操作を実行し、`false`なら実行しません。条件を入れ子にはできません。                                                                                                    |
| `.else()`                         | `.if()`の実行状態を反転します。                                                                                                                                                        |
| `.end()`                          | 条件分岐を終了し、以降の操作を実行状態に戻します。                                                                                                                                     |
| `.tap(callback)`                  | 各要素に`callback(element, index)`を実行します。`element`は操作対象のDOM要素、`index`は操作対象の中での順番（0から始まる番号）です。非同期コールバックの完了は待ちません。             |
| `.addClass(...classNames)`        | クラスを追加します。空白区切りや複数引数に対応します。                                                                                                                                 |
| `.removeClass(...classNames)`     | クラスを削除します。空白区切りや複数引数に対応します。                                                                                                                                 |
| `.toggleClass(className, force?)` | 指定したクラスがあれば削除し、なければ追加します。`force`を指定すると、`true`なら追加、`false`なら削除します。クラス名は一つだけ指定し、空文字や空白を含む値はDOMExceptionになります。 |
| `.setStyle(property, value)`      | HTML要素・SVG要素のインラインスタイルを設定します。プロパティ名は`background-color`などCSSの表記で指定します。                                                                         |
| `.removeStyle(property)`          | HTML要素・SVG要素の指定したインラインスタイルを削除します。プロパティ名は`setStyle()`と同じ表記で指定します。                                                                          |
| `.setAttr(name, value)`           | 属性を設定します。                                                                                                                                                                     |
| `.removeAttr(name)`               | 属性を削除します。                                                                                                                                                                     |
| `.html(htmlString)`               | 内容を指定したHTMLに置き換えます。サニタイズは行いません。利用者が入力した文字列の表示には`.text()`を使ってください。                                                                  |
| `.text(textString)`               | 内容を指定した文字列に置き換えます。HTMLとしては解釈しません。                                                                                                                         |
| `.val(value)`                     | input・select・textarea・option・buttonの`value`を設定します。それ以外の要素には操作しません。                                                                                         |
| `.append(...nodes)`               | 対象要素の末尾にNodeまたは文字列を追加します。                                                                                                                                         |
| `.prepend(...nodes)`              | 対象要素の先頭にNodeまたは文字列を追加します。                                                                                                                                         |
| `.before(...nodes)`               | 対象要素の直前に追加します。                                                                                                                                                           |
| `.after(...nodes)`                | 対象要素の直後に追加します。                                                                                                                                                           |
| `.remove()`                       | 対象要素をDOMから削除します。その後、同じチェーンで操作できる要素はなくなります。                                                                                                      |
| `.empty()`                        | 対象要素を残して、その中の子要素やテキストをすべて削除します。                                                                                                                         |

---

## 注意点

対象がない場合、操作は何もせず、`getElements()`は空配列を返します。不正なCSSセレクタなど、DOM APIの例外はそのまま伝わります。

---

## 不具合報告・問い合わせ

[公開元のIssues](https://github.com/mountain-bell/dom-chainer/issues)へ、パッケージ名・バージョン・実行環境・再現コードを添えて報告してください。

---

## 📄 ライセンス

MIT  
© 2026 mountain-bell

---

## 👤 作者

[mountain-bell](https://github.com/mountain-bell) (a.k.a. MB)
