obtain([], ()=> {
  if (!window.muse.sockets) {
    window.muse.sockets = [];
  }

  class SingleSocket extends EventTarget {
    constructor(addr) {
      super();

      this.cnxnInterval = null;
      this.timeOffset = 0;
      this.connected = false;

      this.connect(addr);
    }

    addListener(evt, cb) {
      this.on(evt, cb);
    }

    on(evt, cb) {
      this.addEventListener(evt, (e)=> {
        cb(e.detail);
      });
    }

    synchronize () {
      var _this = this;
      _this.syncTime = Date.now();
      _this.send({ timeSync: _this.syncTime });
    };

    set onconnect(cb) {
      if (this.connected) cb();
      else this.addEventListener('internal:connect', (e)=> {
        cb();
      });
    }

    set onclose(cb) {
      this.addEventListener('internal:close', (e)=> {
        cb();
      });
    }

    set onerror(cb) {
      this.addEventListener('internal:error', (e)=> {
        cb(e.detail);
      });
    }

    send(msg) {}

    get serverTime() {
      return Date.now() + _this.timeOffset;
    }

    connect(addr) {
      var _this = this;
      if (addr) _this.address = ((muse.useSSL) ? 'wss://' : 'ws://') + addr;
      if ('WebSocket' in window) {
        _this.ws = new WebSocket(_this.address);
        _this.ws.onopen = function ()
        {
          clearInterval(_this.cnxnInterval);
          _this.ws.onmessage = function (evt) {
            var data = JSON.parse(evt.data);
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                if (key == 'serverTime') {
                  _this.timeOffset = (2 * data[key] - (_this.syncTime + Date.now())) / 2;
                  let serTime = new Date(Date.now() + _this.timeOffset);
                } else {
                  _this.dispatchEvent(new CustomEvent(key, { detail: data[key] }));
                };
              }
            }
          };

          _this.send = function (obj, data) {
            if (data) obj = { [obj]: data };
            ws.send(JSON.stringify(obj));
          };

          _this.close = ()=> {
            ws.close();
          };

          //if (!_this.connected) _this.onConnect();

          //_this.synchronize();
          //if (_this.id) _this.send({ _id: _this.id });

          _this.dispatchEvent(new CustomEvent('internal:connect', { detail: _this }));

          _this.connected = true;
        };

        _this.ws.onerror = function (error) {
          _this.dispatchEvent(new CustomEvent('internal:error', { detail: error }));
          clearInterval(_this.connectInterval);
          _this.connectInterval = setInterval(_this.connect.bind(_this), 2000);
        };

        _this.ws.onclose = function () {
          _this.connected = false;
          _this.ws = null;
          console.log('disconnected');
          _this.dispatchEvent(new CustomEvent('internal:close', { detail: false }));
        };
      } else {
        clearInterval(_this.connectInterval);
        console.log('Websocket not supported');
      }
    }
  };

  exports.connect = (addr)=> {
    var ret = muse.sockets.find(sock=>sock.address = addr);
    if (!ret) ret = new SingleSocket(addr);
    return ret;

  };

  provide(exports);
});
