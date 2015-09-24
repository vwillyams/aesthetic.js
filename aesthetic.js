"use strict";

const spaceChar = 0x0020;
const asciiEndChar = 0x007F;
const fullWidthCharOffset = 0xFEE0;
const ideographicSpaceChar = 0x3000;

function toFullWidth(chars) {
  let aesthetic = '';
  for (var i = 0, l = chars.length; i < l; i++) {
    var c = chars[i].charCodeAt(0);
    // don't convert non-ASCII
    if (c != spaceChar && c <= asciiEndChar) {
      c += fullWidthCharOffset;
    } else if (c == spaceChar) { // replace space with...
      c = ideographicSpaceChar; // ideographic space
    }
    aesthetic += String.fromCharCode(c);
  }
  return aesthetic;
}

function addBuffer(element) {
  var node = document.createElement('div');
  node.contentEditable = true;
  element.appendChild(node);
  node.unselectable = "off";
  return node;
}

function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function replaceText(selectedElement){
  selectedElement.focus();
  document.execCommand('SelectAll');
  document.execCommand('Copy');

  let textBuffer;
  try {
    textBuffer = addBuffer(selectedElement.parentNode);
    textBuffer.focus();
    document.execCommand('SelectAll');
    document.execCommand('Paste');
    textBuffer.innerText = toFullWidth(textBuffer.innerText);
    document.execCommand('SelectAll');
    document.execCommand('Copy');
  } finally {
    removeElement(textBuffer);
  }

  // IMPORTANT: Hijacks the clipboard to mimic user input
  selectedElement.focus();
  document.execCommand('SelectAll');
  document.execCommand('Paste');
}

document.body.addEventListener('keydown', function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text and store the selection range
  let selection = window.getSelection();

  let selectedElement = selection.focusNode.childNodes[selection.focusOffset];
  if (!selectedElement) {
    selectedElement = document.activeElement;
  }
  let text = selection.toString();

  if (text && text.length) {

    // Store clipboard state in an external buffer
    let clipboardBuffer;
    let clipboardText;
    try {
      clipboardBuffer = addBuffer(selectedElement.parentNode);
      clipboardBuffer.focus();
      document.execCommand('SelectAll');
      document.execCommand('Paste');
      clipboardText = clipboardBuffer.innerText;

      // Perform the actual text modification
      replaceText(selectedElement);

      // Restore the original clipboard state
      clipboardBuffer.focus();
      document.execCommand('SelectAll');
      document.execCommand('Copy');
    } finally {
      removeElement(clipboardBuffer);
    }

  }
}, false);
