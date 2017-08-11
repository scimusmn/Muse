if (typeof require == 'undefined') var require = false;
var museDir = '';
let script = document.currentScript;
museDir = script.src.substr(0, script.src.lastIndexOf('/') + 1);
if (museDir.includes('C:\\')) museDir = museDir.replace('file:///', '');
if (require) museDir = museDir.replace('file://', '');

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

window.µdir = museDir;

/*Object.prototype.loadProperty = function(params) {
  var cur = params.default;
  get(params.url, { type: 'text' }).then(res=> {
    cur = JSON.parse(res.responseText)[params.name];
  });
  Object.defineProperty(this, params.name, {
    get: function() {
      return cur;
    },

    set: function(val) {
      cur = val;
    },
  });
};*/

/*window.µTrack = Symbol('trackChange');

Number.prototype[µTrack] = function(params) {
  this.trackObj = params.obj;
  var oldValueOf = this.valueOf;
  var oldStringOf = this.toString;
  this.valueOf = function() {
    console.log(this.trackObj[params.name] + ' is the current value ');
    if (this.trackObj.obj[params.name]) return this.trackObj.obj[params.name];
    else return this;
  };

  console.log(this.valueOf);

  this.toString = function() {
    if (this.trackObj.obj[params.name]) return this.trackObj.obj[params.name];
    else return oldValueOf();
  };
};*/

/*class Tracker extends Object {
  constructor(args) {
    super(args);
    var _this = this;

    this.primitive = null;
    this.props = args.property.split('>');
    if (typeof args.object !== 'undefined') {
      this.tracked = args.object;
    }

    if (typeof args.default !== 'undefined') this.primitive = args.default;
    if (typeof args.url !== 'undefined') {
      this.tracked = null;
      get(args.url, { type: 'text' }).then((req)=> {
        _this.tracked = JSON.parse(req.responseText);
      });
    }
  }

  valueOf() {
    if (this.tracked) {
      var val = this.tracked;
      for (let i = 0; i < this.props.length; i++) {
        val = val[this.props[i]];
      }

      return val;
    }

    return this.primitive;
  }

  toString() {
    return this.valueOf().toString();
  }
}*/

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

window.provide = function(exports) {
};

window.obtain = (addr, func)=> {
  var _this = this;
  var objs = [];
  if (addr.length <= 0) func();
  else addr.forEach(function(adr, ind, arr) {
    let next = null;
    if (adr.includes('µ/')) adr = adr.replace('µ/', museDir);
    if (require) objs[ind] = require(adr);
    else get(adr).then((req)=> {
      if (req.responseURL.substr(0, location.origin.length) == location.origin) {
        var provide = function(exps) {
          if (exps.ready || exps.obtained) {
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

        var intro = '//# sourceURL=' + adr + '\n()=>{var exports = {src: "' + adr + '", ready: ';
        var re = /obtain\s*\(\s*\[/g;
        if (req.responseText.match(re)) {
          intro += 'false, obtained: true}; ';
        } else intro += 'true}; ';

        objs[ind] = eval(intro  + req.responseText + ' return exports;}')();
        if (objs[ind].ready) {
          provide(objs[ind]);
        }
      }

    });
  });

  if (require && addr.length) func.apply(null, objs);
};

var app = script.getAttribute('main');

var started = false;

if (!window.customElements) {
  console.log('Webcomponents not natively supported.');
  var scrpt = document.createElement('script');
  scrpt.src = museDir + 'webcomponents-lite.js';
  window.addEventListener('WebComponentsReady', function() {
    console.log('Webcomponents provided through polyfill.');
    obtain([app], (imports)=> {
      if (!started) {
        started = true;
        console.log(document.readyState);
        if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') imports.app.start();
        else document.addEventListener('DOMContentLoaded', function(event) {
          imports.app.start();
        });
      }
    });
  });

  document.head.insertBefore(scrpt, document.currentScript);
} else {
  obtain([app], (imports)=> {
    if (!started) {
      started = true;
      if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') imports.app.start();
      else document.addEventListener('DOMContentLoaded', function(event) {
        imports.app.start();
      });
    }
  });
}
