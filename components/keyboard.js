obtain([`µ/components/museElement.js`], ({ MuseElement })=> {
  if (!customElements.get('key-board')) {

    //console.log('define importDoc');

    class KeyBoard extends MuseElement {
      constructor() {
        super();
      }

      connectedCallback() {
        //register events, check contents, etc.

        var _this = this;

        if (!_this.root) {

          this.makeTransitionState('show', 'hide');
          this.root = _this.attachShadow({ mode: 'open' });
          this.root.innerHTML = `<style> @import "${µdir}/components/css/keyboard.css";</style>`;

          window.importHTML(µdir + 'components/keyboard.html', (link)=> {
            var nodes = Array.from(µ(`[importContent]`, link.import)[0].childNodes);
            nodes.forEach((node)=> {
              _this.root.appendChild(node);
            });

            link.parentElement.removeChild(link);

            µ('li', _this.root).forEach(function (item) {

              let handleKeypress = (e)=> {
                e.stopPropagation();
                e.preventDefault();
                var actEl = document.activeElement;
                if (actEl == null || actEl.tagName != 'INPUT') return false;

                var character = item.textContent; // If it's a lowercase letter, nothing happens to this variable

                var keycode = character && character.charCodeAt(0);

                // Shift keys
                if (item.className.includes('shift')) {
                  shift = _this.classList.toggle('shift');
                  _this.classList.toggle('uppercase', shift);
                  return false;
                }

                // Caps lock

                if (item.className.includes('capslock')) {
                  capslock = _this.classList.toggle('capslock');
                  shift = _this.classList.toggle('shift', capslock);
                  _this.classList.toggle('uppercase', shift);
                  return false;
                }

                // Delete
                if (item.className.includes('delete')) {
                  //actEl.value = actEl.value.slice(0, -1);
                  if (actEl.selectionStart) {
                    var startPos = actEl.selectionStart;
                    var endPos = actEl.selectionEnd;
                    if (startPos == endPos) {
                      actEl.value = actEl.value.substring(0, startPos - 1) + actEl.value.substring(endPos);
                    } else {
                      actEl.value = actEl.value.substring(0, startPos) + actEl.value.substring(endPos);
                    }

                    actEl.setSelectionRange(startPos - 1, startPos - 1);
                  } else {
                    actEl.value.slice(0, -1);
                    actEl.setSelectionRange(startPos - 1, startPos - 1);
                  }

                  return true;
                }

                // Special characters
                if (item.className.includes('symbol'))
                  character = µ('span.' + ((shift) ? 'on' : 'off'), item)[0].innerHTML[0];
                if (item.className.includes('space')) {
                  character = ' ';
                  keycode = 32;
                }

                if (item.className.includes('tab')) {
                  character = '\t';
                  keycode = 9;
                }

                if (item.className.includes('return')) {
                  character = '\n';
                  keycode = 13;
                }

                // Uppercase letter
                if ((capslock && !shift) || shift) character = character.toUpperCase();

                //actEl.value += character;
                if (actEl.selectionStart || actEl.selectionStart == '0') {
                  var startPos = actEl.selectionStart;
                  var endPos = actEl.selectionEnd;
                  actEl.value = actEl.value.substring(0, startPos)
                    + character
                    + actEl.value.substring(endPos, actEl.value.length);
                  actEl.setSelectionRange(startPos + 1, startPos + 1);
                } else {
                  actEl.value += actEl;
                }

                var eventObj = document.createEvent('Events');

                if (eventObj.initEvent) {
                  eventObj.initEvent('keypress', true, true);
                }

                eventObj.keyCode = keycode;
                eventObj.which = keycode;
                eventObj.key = character;
                eventObj.shiftKey = item.className.includes('capslock') || item.className.includes('shift');

                document.activeElement.dispatchEvent(eventObj);

                if (shift && !capslock) shift = _this.classList.toggle('shift', false);
                if (capslock && !shift) shift = true, _this.classList.add('shift');

                _this.classList.toggle('uppercase', shift);

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
          });
        } ///// end if(!root)
      };
    }

    customElements.define('key-board', KeyBoard);
  }

  exports.Keyboard = customElements.get('key-board');

  provide(exports);
});
