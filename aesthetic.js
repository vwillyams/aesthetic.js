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
  var found = false;
  if (element.innerText && element.innerText.indexOf(find) !== -1) {
    element.innerText = element.innerText.replace(find, replace);
    found = true;
  }
  if (element.value && element.value.indexOf(find) !== -1) {
    element.value = element.value.replace(find, replace);
    found = true;
  }
  if (found) {
    // Need to reselect the contents of the element so we can hijack the clipboard
    element.select();
  } else {
    // no good
    // Flow down the DOM tree - used for Facebook comments box and other areas where the DOM isn't quite as sensible as we'd like
   // for (var i = 0; i < element.childNodes.length; i++){
     // modifyElementText(element.childNodes[i], find, replace);
    //}
  }    
}


document.body.addEventListener("keydown", function (event) {

  // Only active if Ctrl + Shift + A is pressed (TODO identify best practice)
  if (event.ctrlKey !== true || event.shiftKey !== true || event.keyCode !== 65) {
    return;
  }

  // Get the selected text
  var selection = window.getSelection();
  var text = selection.toString();

  if (text.length) {    
    var selectedElement = selection.focusNode.childNodes[selection.focusOffset];
    if(selectedElement){
      modifyElementText(selectedElement, text, toFullWidth(text));
    } else {
      // nope this isn't a good approach
      // Brute force find+replace guarantees execution even if selection behaviour is overridden by website
      // modifyElementText(document.activeElement, text, toFullWidth(text));
    }
    // Hijack the clipboard to get around security measures
    document.execCommand("copy");
    document.execCommand("paste");
  }
}, false);
