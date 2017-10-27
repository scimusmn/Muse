'use strict';

obtain(['serialport'], (com)=> {
  exports.Serial = function (port, baudrate) {

    //const parser = new com.parsers.Regex({ regex: /[\r\n]+/ });
    //const parser = new com.parsers.ByteLength({ length: 8 });
    const parser = new com.parsers.Readline({ delimiter: '\r\n' });

    var _this = this;
    let ser = null;
    _this.isOpen = false;
    _this.onOpen = () => {};

    _this.onMessage = () => {};

    _this.onPortNotFound = function (ports) {
      console.log('Port not found');
    };

    _this.write = (str)=> {
      if (_this.isOpen) ser.write(str);
    };

    _this.send = (arr) => {
      if (_this.isOpen) ser.write(new Buffer(arr));
    };

    var openByName = (portName, baud) => {
      console.log('Opening serialport ' + portName);
      ser = new com(portName, {
        baudrate: baud,
      });

      ser.pipe(parser);

      parser.on('data', function (data) {
        _this.onMessage(data);
      });

      ser.on('open', function () {
        _this.isOpen = true;
        _this.onOpen();
      });

      ser.on('error', function () {
        console.log('Error from SerialPort');
      });
    };

    _this.open = (name, baud) => {
      if (name[0] != '/')
        com.list(function (err, ports) {
          let found = false;
          ports.forEach(function (port) {
            if (port.comName.indexOf(name) > -1) {
              name = port.comName;
              found = true;
              openByName(name, baud);
            }
          });

          if (!found) _this.onPortNotFound(ports);
        });

      else openByName(name, baud);
    };

  };

  provide(exports);
});
