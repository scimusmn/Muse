
var shift = 0;
var capslock = false;

var importDoc = document.currentScript.ownerDocument;

importDoc.onReady = ()=> {
  µ('.number, .symbol, .delete', µ('#numpad', importDoc.refDiv)).forEach(function (item) {

    let handleKeypress = (e)=> {
      var actEl = document.activeElement;
      if (actEl == null || actEl.tagName != 'INPUT') return false;

      let _this = item;
      var character = _this.textContent; // If it's a lowercase letter, nothing happens to this variable

      var keycode = character && character.charCodeAt(0);

      // Delete
      if (_this.className.includes('delete')) {
        actEl.value = actEl.value.slice(0, -1);
        return true;
      }

      actEl.value += character;

      var eventObj = document.createEvent('Events');

      if (eventObj.initEvent) {
        eventObj.initEvent('keypress', true, true);
      }

      eventObj.keyCode = keycode;
      eventObj.which = keycode;
      eventObj.key = character;

      document.activeElement.dispatchEvent(eventObj);

      return false;
    };

    let repeatTimeout = null;

    let keyRepeat = (e, time)=> {
      repeatTimeout = setTimeout(keyRepeat, 100);
      return handleKeypress(e);
    };

    item.onmousedown = (e)=> {
      e.stopPropagation();
      e.preventDefault();
      repeatTimeout = setTimeout(keyRepeat, 1000);
      return handleKeypress(e);
    };

    item.onmouseup = (e)=> {
      clearTimeout(repeatTimeout);
    };
  });

};
