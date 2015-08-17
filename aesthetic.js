"use strict";

function toFullWidth(chars) {
  var aesthetic = '';
  for(var i=0, l=chars.length; i<l; i++) {
    var c = chars[i].charCodeAt(0);

    // don't convert spaces or non-ASCII
    if (c != 0x0020 && c <= 0x007F) {
      c += 0xFEE0;
    }
    aesthetic += String.fromCharCode(c);
  }
  return aesthetic;
}

function modifyElementText(element, text){
  // TODO change this into a find-and-replace operation instead of enforcing entire element replacement
  if(element.innerText){
    element.innerText = text;
  }
  if(element.value){
    element.value = text;
  }
  // Need to reselect the contents of the element so we can hijack the clipboard
  element.select();
}


document.body.addEventListener("keydown", function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text
  var selection = window.getSelection();
  var text = selection.toString();
  var selectedElement = selection.focusNode.childNodes[selection.focusOffset];

  if(text.length) {
    text = toFullWidth(text);
    modifyElementText(selectedElement, text);
    // Hijack the clipboard to get around security measures
    document.execCommand("copy");
    document.execCommand("paste");
  }
}, false);