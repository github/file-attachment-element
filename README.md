# &lt;file-attachment&gt; element

Attach files via drag and drop or file input.

## Installation

```
$ npm install @github/file-attachment-element
```

## Usage

```js
import '@github/file-attachment-element'
```

```html
<file-attachment directory input="upload">
  <input id="upload" type="file" multiple>
</file-attachment>
```

### Optional attributes

- `file-attachment[directory]` enables traversing directories.
- `file-attachment[input]` points to the ID of a file input inside of `<file-attachment>`. Files selected from the `<input>` will be attached to `<file-attachment>`. Supplying an input is strongly recommended in order to ensure users can upload files without a mouse or knowing where to paste files.

### Styling drag state

A boolean `[hover]` attribute is present on `<file-attachment>` while files are dragged over the element.

```css
file-attachment[hover] { border: 2px dashed grey; }
```

### Events

- `file-attachment-accept` – Files were dropped onto the element. Call `event.preventDefault()` to prevent the drop. Bubbles.
- `file-attachment-accepted` – Files were added to the attachment list and can be uploaded by the host app. Bubbles.

## Browser support

Browsers without native [custom element support][support] require a [polyfill][].

- Chrome
- Firefox
- Safari
- Microsoft Edge

[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
