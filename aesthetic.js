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

function modifyElementText(element, find, replace){
  if(element.innerText){
    element.innerText = element.innerText.replace(find, replace);
  }
  if(element.value){
    element.value = element.value.replace(find, replace);
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
    modifyElementText(selectedElement, text, toFullWidth(text));
    // Hijack the clipboard to get around security measures
    document.execCommand("copy");
    document.execCommand("paste");
  }
}, false);
