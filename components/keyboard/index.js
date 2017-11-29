
var shift = 0;
var capslock = false;

var importDoc = document.currentScript.ownerDocument;

importDoc.onReady = ()=> {
  µ('li', µ('#keyboard', importDoc.refDiv)).forEach(function (item) {

    let handleKeypress = (e)=> {
      var actEl = document.activeElement;
      if (actEl == null || actEl.tagName != 'INPUT') return false;

      let _this = item;
      var character = _this.textContent; // If it's a lowercase letter, nothing happens to this variable

      var keycode = character && character.charCodeAt(0);

      // Shift keys
      if (_this.className.includes('shift')) {
        shift = µ('#keyboard').classList.toggle('shift');
        µ('#keyboard').classList.toggle('uppercase', shift);
        return false;
      }

      // Caps lock

      if (_this.className.includes('capslock')) {
        capslock = µ('#keyboard').classList.toggle('capslock');
        shift = µ('#keyboard').classList.toggle('shift', capslock);
        µ('#keyboard').classList.toggle('uppercase', shift);
        return false;
      }

      // Delete
      if (_this.className.includes('delete')) {
        actEl.value = actEl.value.slice(0, -1);
        return true;
      }

      // Special characters
      if (_this.className.includes('symbol'))
        character = µ('span.' + ((shift) ? 'on' : 'off'), _this)[0].innerHTML[0];
      if (_this.className.includes('space')) {
        character = ' ';
        keycode = 32;
      }

      if (_this.className.includes('tab')) {
        character = '\t';
        keycode = 9;
      }

      if (_this.className.includes('return')) {
        character = '\n';
        keycode = 13;
      }

      // Uppercase letter
      if ((capslock && !shift) || shift) character = character.toUpperCase();

      actEl.value += character;

      var eventObj = document.createEvent('Events');

      if (eventObj.initEvent) {
        eventObj.initEvent('keypress', true, true);
      }

      eventObj.keyCode = keycode;
      eventObj.which = keycode;
      eventObj.key = character;
      eventObj.shiftKey = _this.className.includes('capslock') || _this.className.includes('shift');

      document.activeElement.dispatchEvent(eventObj);

      if (shift && !capslock) shift = µ('#keyboard').classList.remove('shift');
      if (capslock && !shift) shift = true, µ('#keyboard').classList.add('shift');

      µ('#keyboard').classList.toggle('uppercase', shift);

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
