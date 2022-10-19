## Draw HTML to Canvas
Draw a HTML text template into a canvas context.

```js
// To import
const drawHTML = require('draw-html-to-canvas');

// To use
const canvas = yourCanvas;
const context = canvas.getContext('2d');

const input = "<b>Follow</b> the <i>train,</i> <b><i>CJ!</i></b><br><b>MOVE!</b>;

drawHTML(input, context, { fontFamily: 'Arial', fontSize: 24 }, canvas);

// Available options
options: {
  fontFamily: 'string',
  fontSize: number,
  posX: number,
  posY: number,
}
```