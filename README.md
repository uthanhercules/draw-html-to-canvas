## Render HTML to Canvas
Render a HTML text template into a canvas context.

```js
// To import
const drawHTML = require('render-html-into-canvas');

// To use
const canvas = yourCanvas;
const context = canvas.getContext('2d');

const input = "<b>Follow</b> the <i>train,</i> <b><i>CJ!</i></b><br><b>MOVE!</b>;

drawHTML(input, context, { fontFamily: 'Arial', fontSize: 24 }, canvas);

// Available options
options: {
  fontFamily: 'string',
  fontSize: number,
  padding: number,
  posX: number,
  posY: number,
}
```