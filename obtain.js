var get = function(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

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

if (typeof require == 'undefined') var require = false;
var museDir = '';
let script = document.currentScript;
museDir = script.src.substr(0, script.src.lastIndexOf('/') + 1);
if (require) museDir = museDir.replace('file://', '');
console.log(museDir + ' is teh current script');

window.provide = function(exports) {
  if (exports && exports.return) exports.return();
};

window.obtain = (addr, func)=> {
  var _this = this;
  /*if (typeof addr == 'string') {
    if (addr.includes('µ')) addr = addr.replace('µ', museDir);
    var ret = {
        onLoadFxns: [],
        loaded: false,
        µ: (fxn)=> {
          if (!ret.loaded) ret.onLoadFxns.push(fxn);
          else fxn();
        },
      };
    if (require) {
      ret = require(addr);
      ret.loaded = true;
      ret.µ = (fxn)=> {fxn();};
    } else {
      get(addr).then((req)=> {
        let rt = eval('()=>{var exports = {}; ' + req.responseText + ' return exports;};')();
        for (let propName in rt) {
          if (rt.hasOwnProperty(propName)) {
            ret[propName] = rt[propName];
          }
        }

        ret.loaded = true;
        ret.onLoadFxns.forEach(function(fxn, ind, arr) {
            fxn();
          });
      });
    }

    return ret;
  } else {*/
  var objs = [];
  addr.forEach(function(adr, ind, arr) {
    let next = null;
    if (adr.includes('µ')) adr = adr.replace('µ', museDir);
    if (require) objs[ind] = require(adr);
    else get(adr).then((req)=> {
      var onReady = function() {
        let check = true;
        objs[ind].ready = true;
        for (var i = 0; i < objs.length; i++) {
          if (!objs[i] || !objs[i].ready) check = false;
        }

        if (check) {
          func.apply(_this, objs);
        }
      };

      var intro = '()=>{var exports = {ready: ';
      var re = /obtain\s*\(\s*\[/g;
      if (req.responseText.match(re)) {
        intro += 'false, obtained: true}; ';
      } else intro += 'true}; ';

      objs[ind] = eval(intro + req.responseText + ' return exports;};')();
      if (objs[ind].ready) {
        onReady();
      } else {
        objs[ind].return = onReady;
      }
    });
  });

  if (require) func.apply(null, objs);

  //}
};

var app = script.getAttribute('main');
obtain(['µ/utils.js', app], (muse, app)=> {

});
