"use strict";

function toFullWidth(chars) {
  var aesthetic = '';
  for(var i=0, l=chars.length; i<l; i++) {
    var c = chars[i].charCodeAt(0);

    // don't convert non-ASCII
    if (c != 0x0020 && c <= 0x007F) {
      c += 0xFEE0;
    } else if(c == 0x0020) { // replace space with...
      c = 0x3000; // ideographic space 
    }
    aesthetic += String.fromCharCode(c);
  }
  return aesthetic;
}

function selectElement(element){
  var range = document.createRange();
  range.selectNode(element);
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function modifyElementText(element, find, replace){
  var foundElement;
  if (element.type == 'textarea' || element.type == 'input'){
    foundElement = element;
  }
  else if (element.nodeType == 3) {
    foundElement = element.parentNode;
  }
  var found = false;
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
    for (var i = 0; i < element.childNodes.length; i++) {
      modifyElementText(element.childNodes[i], find, replace);
    }
  }
}

document.body.addEventListener("keydown", function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text
  var selection = window.getSelection();
  var originalRange = selection.getRangeAt(0);
  var text = selection.toString();

  if (text.length) {    
    var selectedElement = selection.focusNode.childNodes[selection.focusOffset];
    if (!selectedElement) {
      selectedElement = document.activeElement;
    }
    modifyElementText(selectedElement, text, toFullWidth(text));
    // Hijack the clipboard to get around security measures
    document.execCommand("copy");
    var range = document.createRange();
    range.setStart(originalRange.startContainer, originalRange.startOffset);
    range.setEnd(originalRange.endContainer, originalRange.endOffset);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("paste");
  }
}, false);
