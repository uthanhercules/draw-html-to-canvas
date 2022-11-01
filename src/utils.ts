import { html2json as convertHTML } from 'html2json';
import { IHTMLJson, IHTMLObject } from './types/utils';

const createJsonFromHTML = (plainHTML: string) => {
  const input = plainHTML.replace(
    /(<\/?)(\w+>)/gm,
    (_, $1, $2) => $1 + $2.toLowerCase()
  );
  return convertHTML(input);
};

const createStyleString = (
  textData: IHTMLObject,
  fontSize: number | undefined,
  fontFamily: string | undefined
) => {
  let styleString = '';

  if (textData.bold) styleString += 'bold ';
  if (textData.italic) styleString += 'italic ';

  return `${styleString}${fontSize}px ${fontFamily}`;
};

const createTextData = (plainHTML: string) => {
  return createJsonFromHTML(plainHTML).child;
};

const createTextStyleObject = (plainHTML: string) => {
  const textData: any = createTextData(plainHTML);
  let output: IHTMLObject[] = [];

  function generateHTMLObject(current: IHTMLJson, context: IHTMLObject = {}) {
    if (current.text)
      if (current.node === 'text') {
        output = [
          ...output,
          ...current.text
            .split(' ')
            .filter((word) => word)
            .map((word) => ({ value: word, ...context })),
        ];

        return;
      }

    if (current.node === 'element') {
      if (current.tag === 'b' || current.tag === 'strong') context.bold = true;
      if (current.tag === 'i' || current.tag === 'em') context.italic = true;
      if (current.tag === 'br') output.push({ linebreak: true });
      if (current.tag === 'u') context.underline = true;
      if (current.tag === 's') context.lineThrough = true;
    }

    if (current.child && current.child.length) {
      current.child.forEach((node) => generateHTMLObject(node, { ...context }));
    }
  }

  textData.forEach((node: IHTMLJson) => generateHTMLObject(node));
  return output;
};

const linemaker = (canvas: any, thickness = 1, color = '#000') => {
  let open = false;
  let coords = { y: 0, startX: 0, endX: 0 };

  return {
    open(x = 0, y = 0) {
      open = true;
      coords = { y, startX: x, endX: x };
    },

    move(value: number) {
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
};

export { createStyleString, createTextData, createTextStyleObject, linemaker };
