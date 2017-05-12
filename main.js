window.µ = function(id, elem) {
  var ret;
  var root = ((elem) ? elem : document);
  var spl = id.split('>');
  switch (spl[0].charAt(0)) {
    case '|':
      ret = root;
      break;
    case '+':
      ret = document.createElement(spl[0].substring(1));
      if (elem) elem.appendChild(ret);
      break;
    case '#':
      ret = root.querySelector(spl[0]);
      break;
    default:
      ret = root.querySelectorAll(spl[0]);

      //if(ret.length==1) ret = ret[0];
      //else{
      ret.forEach = function(cb) {
          for (let i = 0; i < ret.length; i++) {
            cb(i, ret[i]);
          }
        };

      ret.style = function(mem, val) {
          for (let i = 0; i < ret.length; i++) {
            ret[i].style[mem] = val;
          }
        };

      //}
      break;
  }
  if (spl.length <= 1) return ret;
  else return ret.getAttribute(spl[1]);
};

window.inheritFrom = function(parent, addMethods) {
  var _parent = parent;
  var ret = function() {
    if (_parent) {
      _parent.apply(this, arguments);
    }
  };

  //console.log(_parent);

  ret.prototype = Object.create(_parent && _parent.prototype, {
    constructor: {
      value: ret,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (_parent) ret.__proto__ = _parent;

  if (typeof addMethods === 'function')
    addMethods.call(ret.prototype);

  return ret;
};

window.get = function(url, params) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    if (params && params.type) req.responseType = params.type;
    if (params && params.credentials) req.open('GET', url, params.credentials);
    else req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req);
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error('Network Error'));
    };

    // Make the request
    req.send();
  });
};

window.post = function(url, obj) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('POST', url);
    req.setRequestHeader('Content-type', 'application/json');

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error('Network Error'));
    };

    // Make the request
    req.send(JSON.stringify(obj));
  });
};

if (typeof require == 'undefined') var require = false;
var museDir = '';
let script = document.currentScript;
museDir = script.src.substr(0, script.src.lastIndexOf('/') + 1);
if (require) museDir = museDir.replace('file://', '');

window.provide = function(exports) {
};

window.obtain = (addr, func)=> {
  var _this = this;
  var objs = [];
  addr.forEach(function(adr, ind, arr) {
    let next = null;
    if (adr.includes('µ/')) adr = adr.replace('µ/', museDir);
    if (require) objs[ind] = require(adr);
    else get(adr).then((req)=> {
      if (req.responseURL.substr(0, location.origin.length) == location.origin) {
        var provide = function(exps) {
          //console.log('src ::: ' + exps.src);
          if (objs[ind].ready || exps.obtained) {
            if (exps) objs[ind] = exps;
            let check = true;
            objs[ind].ready = true;
            for (var i = 0; i < arr.length; i++) {
              if (!objs[i] || !objs[i].ready) check = false;
            }

            if (check) {
              func.apply(null, objs);
            }
          }
        };

        var intro = '()=>{var exports = {src: "' + adr + '", ready: ';
        var re = /obtain\s*\(\s*\[/g;
        if (req.responseText.match(re)) {
          intro += 'false, obtained: true}; ';
        } else intro += 'true}; ';

        objs[ind] = eval(intro + req.responseText + ' return exports;};')();
        if (objs[ind].ready) {
          provide(objs[ind]);
        }
      }

    });
  });

  if (require) func.apply(null, objs);
};

var app = script.getAttribute('main');

if (typeof customElements === 'undefined') {
  var scrpt = document.createElement('script');
  scrpt.src = museDir + 'webcomponents-lite.js';
  window.addEventListener('WebComponentsReady', function() {
    obtain([app], (imports)=> {
      if (document.readyState === 'complete') imports.app.run();
      else document.addEventListener('DOMContentLoaded', function(event) {
        imports.app.run();
      });
    });
  });

  document.head.insertBefore(scrpt, document.currentScript);
} else {
  obtain([app], (imports)=> {
    if (document.readyState === 'complete') imports.app.run();
    else document.addEventListener('DOMContentLoaded', function(event) {
      imports.app.run();
    });
  });
}
