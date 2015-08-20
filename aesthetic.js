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
  var node = document.createElement('textarea');
  element.appendChild(node);
  return node;
}

// Selects an element, removing all other selections
function selectElement(element) {
  let selection = window.getSelection();
  selection.removeAllRanges();
  element.select();
}

// Creates a copy of a Range object (since it's possible that the original range has expired)
// and sets window.selection to contain that range
function setSelection(selectionRange) {
  let selection = window.getSelection();
  selection.removeAllRanges();

  let range = document.createRange();
  range.setStart(selectionRange.startContainer, selectionRange.startOffset);
  range.setEnd(selectionRange.endContainer, selectionRange.endOffset);

  selection.addRange(range);
}

function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

document.body.addEventListener('keydown', function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text and store the selection range
  let selection = window.getSelection();
  let text = selection.toString();
  // TODO this works but should be better
  var originalRange = selection.getRangeAt(0);

  let selectedElement = selection.focusNode.childNodes[selection.focusOffset];
  if (!selectedElement) {
    selectedElement = document.activeElement;
  }

  let clipboardBuffer;
  try {
    clipboardBuffer = addBuffer(selectedElement.parentNode);
    selectElement(clipboardBuffer);
    document.execCommand('paste');
    var clipboardText = clipboardBuffer.innerText;
  } finally {
    removeElement(clipboardBuffer);
  }

  if (text.length) {

    let textBuffer;
    try {
      textBuffer = addBuffer(selectedElement.parentNode);
      textBuffer.innerText = toFullWidth(text);
      selectElement(textBuffer);
      document.execCommand('copy');
    } finally {
      removeElement(textBuffer);
    }
    // Hijack the clipboard to get around security measures
    setSelection(originalRange);
    document.execCommand('paste');

    // Restore the original clipboard state
    let clipboardBuffer;
    try {
      clipboardBuffer = addBuffer(document.body.childNodes[0]);
      clipboardBuffer.innerText = clipboardText;
      selectElement(clipboardBuffer);
      document.execCommand('copy');
      selection.removeAllRanges();
    } finally {
      removeElement(clipboardBuffer);
    }

  }
}, false);
