function drawHTML(HTMLText, context, options) {
  if (!options) options = {};
  if (!options.fontFamily) options.fontFamily = "sans-serif";
  if (!options.fontSize) options.fontSize = 16;
  if (!options.posX) options.posX = 0;
  if (!options.posY) options.posY = 0;

  context.font = `${options.fontSize}px ${options.fontFamily}`;

  const textObject = createTextStyleObject(HTMLText);
  const wordSpacing = context.measureText(" ").width;
  const lineWidth = [];
  const lineHeight = options.fontSize * 1.4;

  let currentLine = 1;
  let currentLineSize = 0;

  textObject.forEach((word, index) => {
    context.font = createStyleString(
      word,
      options.fontSize,
      options.fontFamily
    );
    const wordWidth = context.measureText(word.value).width + wordSpacing;

    if (word.linebreak) {
      lineWidth.push(currentLineSize);
      currentLineSize = 0;
      return;
    }

    const totalSize = currentLineSize + wordWidth;
    if (totalSize > context.canvas.width - 32) {
      lineWidth.push(currentLineSize);
      currentLineSize = wordWidth;
    } else {
      currentLineSize += wordWidth;
    }

    if (index === textObject.length - 1) {
      lineWidth.push(currentLineSize);
    }
  });

  let currentLineWidth = 0;
  let positionX = options.posX;
  let positionY = options.posY;

  let underline = linemaker(context);
  let lineThrough = linemaker(context);

  const commitDrawLines = () => {
    if (underline.isOpen()) {
      underline.commit();
    }
    if (lineThrough.isOpen()) {
      lineThrough.commit();
    }
  };

  textObject.forEach((word, index) => {
    if (!word.value && !word.linebreak) return;
    if (word.linebreak) {
      positionX = 0;
      positionY += lineHeight;
      currentLine++;
      currentLineWidth = 0;
      commitDrawLines();
      return;
    }

    context.font = createStyleString(
      word,
      options.fontSize,
      options.fontFamily
    );

    const measures = context.measureText(word.value);
    const rawWordWidth = measures.width;
    const wordWidth = context.measureText(word.value).width + wordSpacing;

    currentLineWidth += wordWidth;

    if (currentLineWidth > context.canvas.width - 32) {
      positionX = 0;
      positionY += lineHeight;
      currentLine++;
      currentLineWidth = wordWidth;
      commitDrawLines();
    }

    const position = positionX;
    positionX += context.measureText(word.value).width + wordSpacing;

    const renderX =
      position + (context.canvas.width / 2 - lineWidth[currentLine - 1] / 2);
    const renderY = context.canvas.height / 2 + positionY;

    context.fillText(word.value, renderX, renderY);

    if (word.underline) {
      if (!underline.isOpen()) {
        underline.open(renderX, renderY + 2);
      } else {
        underline.move(wordSpacing);
      }

      underline.move(rawWordWidth);

      const nextWord = textObject[index + 1];

      if (!nextWord || !nextWord.underline) {
        underline.commit();
      }
    }

    if (word.lineThrough) {
      if (!lineThrough.isOpen()) {
        lineThrough.open(renderX, renderY - options.fontSize * 0.25);
      } else {
        lineThrough.move(wordSpacing);
      }

      lineThrough.move(rawWordWidth);

      const nextWord = textObject[index + 1];

      if (!nextWord || !nextWord.lineThrough) {
        lineThrough.commit();
      }
    }
  });
}

function linemaker(canvas, thickness = 1, color = "#000") {
  let open = false;
  let coords = { y: 0, startX: 0, endX: 0 };

  return {
    open(x = 0, y = 0) {
      open = true;
      coords = { y, startX: x, endX: x };
    },

    move(value) {
      coords.endX += value;
    },

    isOpen() {
      return open;
    },

    commit() {
      if (!open) return;

      canvas.beginPath();
      canvas.strokeStyle = color;
      canvas.lineWidth = thickness;
      canvas.moveTo(coords.startX, coords.y);
      canvas.lineTo(coords.endX, coords.y);
      canvas.stroke();

      open = false;
    },
  };
}

function createTextStyleObject(plainHTML) {
  const textData = createTextData(plainHTML);
  let output = [];

  function generateHTMLObject(current, context = {}) {
    if (current.node === "text") {
      output = [
        ...output,
        ...current.text
          .split(" ")
          .filter((word) => word)
          .map((word) => ({ value: word, ...context })),
      ];

      return;
    }

    if (current.node === "element") {
      if (current.tag === "b" || current.tag === "strong") context.bold = true;
      if (current.tag === "i" || current.tag === "em") context.italic = true;
      if (current.tag === "br") output.push({ linebreak: true });
      if (current.tag === "u") context.underline = true;
      if (current.tag === "s") context.lineThrough = true;
    }

    if (current.child && current.child.length) {
      current.child.forEach((node) => generateHTMLObject(node, { ...context }));
    }
  }

  textData.forEach((node) => generateHTMLObject(node));
  return output;
}

function createTextData(plainHTML) {
  return createJsonFromHTML(plainHTML).child;
}

function createJsonFromHTML(plainHTML) {
  const convertHTML = require("html2json").html2json;

  return convertHTML(plainHTML);
}

function createStyleString(textData, fontSize, fontFamily) {
  let styleString = "";

  if (textData.bold) styleString += "bold ";
  if (textData.italic) styleString += "italic ";

  return `${styleString}${fontSize}px ${fontFamily}`;
}

module.exports = drawHTML;
