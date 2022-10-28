import { createTextStyleObject, createStyleString, linemaker } from './utils';

const drawHTML = (
  HTMLText: string,
  context: CanvasRenderingContext2D,
  options: {
    fontFamily?: string;
    fontSize?: number;
    padding?: number;
    posX?: number;
    posY?: number;
  }
) => {
  if (!options) options = {};
  if (!options.fontFamily) options.fontFamily = 'sans-serif';
  if (!options.fontSize) options.fontSize = 16;
  if (!options.posX) options.posX = 0;
  if (!options.posY) options.posY = 0;

  context.font = `${options.fontSize}px ${options.fontFamily}`;

  const textObject = createTextStyleObject(HTMLText);
  const wordSpacing = context.measureText(' ').width;
  const lineWidth: number[] = [];
  const lineHeight = options.fontSize * 1.4;

  let currentLine = 1;
  let currentLineSize = 0;

  textObject.forEach((word, index) => {
    context.font = createStyleString(
      word,
      options.fontSize,
      options.fontFamily
    );

    if (!word.value) word.value = '';

    const wordWidth = context.measureText(word.value).width + wordSpacing;

    if (word.linebreak) {
      lineWidth.push(currentLineSize);
      currentLineSize = 0;
      return;
    }

    const totalSize = currentLineSize + wordWidth;

    if (!options.padding) options.padding = 32;

    if (totalSize > context.canvas.width - options.padding) {
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

  const underline = linemaker(context);
  const lineThrough = linemaker(context);

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

    if (!word.value) word.value = '';

    const measures = context.measureText(word.value);
    const rawWordWidth = measures.width;
    const wordWidth = context.measureText(word.value).width + wordSpacing;

    currentLineWidth += wordWidth;

    if (!options.padding) options.padding = 32;

    if (currentLineWidth > context.canvas.width - options.padding) {
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
        if (!options.fontSize) options.fontSize = 16;

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
};

export default drawHTML;
