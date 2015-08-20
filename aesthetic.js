"use strict";

const spaceChar = 0x0020;
const asciiEndChar = 0x007F;
const fullWidthCharOffset = 0xFEE0;
const ideographicSpaceChar = 0x3000;

function toFullWidth(chars) {
  let aesthetic = '';
  for(var i=0, l=chars.length; i<l; i++) {
    var c = chars[i].charCodeAt(0);
    // don't convert non-ASCII
    if (c != spaceChar && c <= asciiEndChar) {
      c += fullWidthCharOffset;
    } else if(c == spaceChar) { // replace space with...
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
function selectElement(element){
  let selection = window.getSelection();
  selection.removeAllRanges();
  element.select();
}

// Creates a copy of a Range object (in the likely case that the original range has expired)
// and sets window.selection to contain that range
function setSelection(selectionRanges){
  let selection = window.getSelection();
  selection.removeAllRanges();

  for (var i = 0; i < selectionRanges.length; i++) {
    let selectionRange = selectionRanges[i];

    let range = document.createRange();
    range.setStart(selectionRange.startContainer, selectionRange.startOffset);
    range.setEnd(selectionRange.endContainer, selectionRange.endOffset);

    selection.addRange(range);
  }
}

document.body.addEventListener('keydown', function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text and store the selection range
  let selection = window.getSelection();
  // TODO this works but should be better
  var originalRanges = [];
  for (var i = 0; i < selection.rangeCount; i++) {
    originalRanges.push(selection.getRangeAt(i));
  }
  console.log(originalRanges);
  let text = selection.toString();

  //let clipboardBuffer = addBuffer();
  //selectElement(clipboardBuffer);
  //document.execCommand('paste');
  //console.log(clipboardBuffer);

  if (text.length) {

    var selectedElement = selection.focusNode.childNodes[selection.focusOffset];
    if (!selectedElement) {
      selectedElement = document.activeElement;
    }

    let textBuffer = addBuffer(selectedElement.parentNode);
    textBuffer.innerText = toFullWidth(text);
    selectElement(textBuffer);
    document.execCommand('copy');
    selectedElement.parentNode.removeChild(textBuffer);

    // Hijack the clipboard to get around security measures
    if (selectedElement.select) {
      // Prefer element-specific selection method
      selectElement(selectedElement);
    } else {
      // But if that's not available, do it manually...
      setSelection(originalRanges);
    }
    document.execCommand('paste');

    // Restore the original clipboard state
//    clipboardBuffer.select();
//    document.execCommand('copy');
//    selection.removeAllRanges();

  }
  //document.body.removeChild(clipboardBuffer);
}, false);
