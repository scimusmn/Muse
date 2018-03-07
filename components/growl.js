
obtain([`${__dirname}/museElement.js`], ({ MuseElement })=> {
  if (!customElements.get('muse-growl')) {
    var dir = '';
    if (__dirname) dir = __dirname;
    else dir = exports.src.substr(0, exports.src.lastIndexOf('/'));

    //window.loadCSS(__dirname + '/button.css');

    class MuseGrowl extends MuseElement {
      constructor() {
        super();

        this.displayTime = 3000;
      }

      message(text, type) {
        this.display.textContent = text;
        this.className = type;
        this.alert = true;
      }

      connectedCallback() {
        //register events, check contents, etc.
        var _this = this;

        if (!_this.root) {

          this.makeTransitionState('alert');
          this.root = _this.attachShadow({ mode: 'open' });
          this.root.innerHTML = `<style> @import "${dir}/css/growl.css";</style>`;

          _this.display = µ('+div', _this.root);
        }

        _this.onAlert = ()=> {
          clearTimeout(_this.alertTO);
          _this.alertTO = setTimeout(()=> {
            _this.alert = false;
          }, _this.displayTime);
        };
      };
    }

    customElements.define('muse-growl', MuseGrowl);
  }

  exports.Growl = customElements.get('muse-growl');
});
