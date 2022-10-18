function drawHTML(HTMLText, context, options) {
  if (!options) options = {};
  if (!options.fontFamily) options.fontFamily = 'sans-serif';
  if (!options.fontSize) options.fontSize = 16
  if (!options.width) options.width = context.canvas.width;
  if (!options.height) options.height = context.canvas.height;
  if (!options.posX) options.posX = 0;
  if (!options.posY) options.posY = 0;
  
  context.font = `${options.fontSize}px ${options.fontFamily}`;

  const textObject = createTextStyleObject(HTMLText)
  const wordSpacing = context.measureText(' ').width;
  const lineWidth = [];
  const lineHeight = options.fontSize * 1.4;

  let currentLine = 1
  let currentLineSize = 0;
  textObject.forEach((word, index) => {
    context.font = createStyleString(word, options.fontSize, options.fontFamily)
    const wordWidth = context.measureText(word.value).width + wordSpacing;

    if (word.linebreak) {
      lineWidth.push(currentLineSize);
      currentLineSize = 0;
      return;
    }

    const totalSize = currentLineSize + wordWidth;
    if (totalSize > options.width)  {
      lineWidth.push(currentLineSize);
      currentLineSize = wordWidth
    } else {
      currentLineSize += wordWidth
    }

    if (index === textObject.length -1) {
      lineWidth.push(currentLineSize)
    }
  })

  let currentLineWidth = 0
  let positionX = options.posX
  let positionY = options.posY

  textObject.forEach(word => {
    if (!word.value && !word.linebreak) return;
    if (word.linebreak) {
      positionX = 0
      positionY += lineHeight
      currentLine++
      currentLineWidth = 0
      return
    }

    context.font = createStyleString(word, options.fontSize, options.fontFamily)
    const wordWidth = context.measureText(word.value).width + wordSpacing;
    currentLineWidth += wordWidth

    if (currentLineWidth > options.width) {
      positionX = 0
      positionY += lineHeight
      currentLine++
      currentLineWidth = wordWidth
    }

    const position = positionX;
    positionX += context.measureText(word.value).width + wordSpacing

    const renderX = position + ((options.width / 2) - (lineWidth[currentLine - 1] / 2))
    const renderY = (options.height / 2) + positionY

    context.fillText(word.value, renderX, renderY)
  })
}

function createTextStyleObject(plainHTML) {
  const textData = createTextData(plainHTML)
  let output = [];
  function generateHTMLObject(current, context = {}) {
  
    if (current.node === 'text') {
      output = [
        ...output, 
        ...current.text.split(' ')
        .filter(word => word)
        .map(word => ({ value: word, ...context }))
      ]
  
      return;
    }
  
    if (current.node === 'element') {
      if (current.tag === 'b' || current.tag === 'strong') context.bold = true;
      if (current.tag === 'i' || current.tag === 'em') context.italic = true;
      if (current.tag === 'br') output.push({ linebreak: true });
    }
  
    if (current.child && current.child.length) {
      current.child.forEach(node => generateHTMLObject(node, { ...context }));
    }
  }

  textData.forEach(node => generateHTMLObject(node));
  return output
}

function createTextData(plainHTML) {
  return createJsonFromHTML(plainHTML).child;
}

function createJsonFromHTML(plainHTML) {
  const convertHTML = require('html2json').html2json;

  return convertHTML(plainHTML);
}

function createStyleString(textData, fontSize, fontFamily) {
  let styleString = '';

  if (textData.bold) styleString += 'bold ';
  if (textData.italic) styleString += 'italic ';

  return `${styleString}${fontSize}px ${fontFamily}`;
}

module.exports = drawHTML