"use strict";

const spaceChar = 0x0020;
const asciiEndChar = 0x007F;
const fullWidthCharOffset = 0xFEE0;
const ideographicSpaceChar = 0x3000;

function toFullWidth(chars) {
  let aesthetic = '';
  for(var c of chars) {
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

// Selects an element, removing all other selections
function selectElement(element){
  let range = document.createRange();
  range.selectNode(element);

  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// Creates a copy of a Range object (in the likely case that the original range has expired)
// and sets window.selection to contain that range
function setSelection(selectionRange){
  let range = document.createRange();
  range.setStart(selectionRange.startContainer, selectionRange.startOffset);
  range.setEnd(selectionRange.endContainer, selectionRange.endOffset);

  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function modifyElementText(element, find, replace){
  let foundElement;
  if (element.type == 'textarea' || element.type == 'input'){
    foundElement = element;
  }
  else if (element.nodeType == 3) {
    foundElement = element.parentNode;
  }

  let found = false;
  if (foundElement) {
    if (foundElement.innerText && foundElement.innerText.indexOf(find) !== -1) {
      foundElement.innerText = foundElement.innerText.replace(find, replace);
      found = true;
    } else if (foundElement.value && foundElement.value.indexOf(find) !== -1) {
      foundElement.value = foundElement.value.replace(find, replace);
      found = true;
    }
  }

  if (found) {    
    // Need to reselect the contents of the element so we can hijack the clipboard
      selectElement(foundElement);
  } else {
    // Flow down the DOM tree - used for Facebook comments box and other areas where the DOM isn't quite as sensible as we'd like
    for (var childNode in element.childNodes) {
      modifyElementText(childNode, find, replace);
    }
  }
}

document.body.addEventListener("keydown", function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text and store the selection range
  let selection = window.getSelection();
  // TODO this works but should be better
  let originalRange = selection.getRangeAt(0);
  let text = selection.toString();

  if (text.length) {    
    let selectedElement = selection.focusNode.childNodes[selection.focusOffset];
    if (!selectedElement) {
      selectedElement = document.activeElement;
    }
    modifyElementText(selectedElement, text, toFullWidth(text));
    // Hijack the clipboard to get around security measures
    document.execCommand("copy");
    setSelection(originalRange);
    document.execCommand("paste");
  }
}, false);
