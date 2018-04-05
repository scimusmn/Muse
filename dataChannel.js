'use strict';

obtain([], ()=> {
  var dataChannel = function (signal) {
    var _this = this;

    var listeners = {};

    _this.onConnect = ()=> {};

    _this.onClose = ()=> {};

    _this.onBadCandidates = ()=> {};

    _this.addListener = (evt, cb)=> {
      listeners[evt] = cb;
    };

    var getChannel = (channel)=> {
      console.log('getting channel');
      _this.channel = channel;

      _this.channel.onopen = ()=> {
        _this.onConnect();
      };

      _this.channel.onclose = ()=> {
        _this.onClose();
      };

      _this.channel.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (key in listeners) listeners[key](data[key], data);
          }
        }
      };

      _this.send = (msg)=> {
        _this.channel.send(JSON.stringify(msg));
      };
    };

    _this.connect = (remoteId)=> {
      _this.remoteId = remoteId;
      getChannel(this.cnxn.createDataChannel('channelName'));

      if (_this.receivedCandidates) {
        console.log('got candidates');
        _this.cnxn.createOffer(localDesc, logError);
      } else _this.attemptConnect = true;
    };

    function logError(error) {
      console.log(error.name + ': ' + error.message);
    }

    var configuration = {
      iceServers: [{
        urls: 'stun:stun2.l.google.com:19302',
      },],
    };

    this.cnxn = new RTCPeerConnection(configuration);

    _this.cnxn.ondatachannel = (event)=> {
      console.log('got data channel');
      getChannel(event.channel);
    };

    _this.cnxn.onicecandidate = (evt)=> {
      console.log(evt.candidate);
      signal.send({ connect: {
        origin: signal.id,
        target: _this.remoteId,
        candidate: evt.candidate,
      }, });
    };

    var localDesc = (desc)=> {
      _this.cnxn.setLocalDescription(desc, function () {
        console.log(_this.cnxn.localDescription);
        signal.send({ offer: {
          origin: signal.id,
          target: _this.remoteId,
          sdp: _this.cnxn.localDescription,
        }, });
      }, logError);
    };

    /*_this.cnxn.onnegotiationneeded = function () {
      _this.cnxn.createOffer(localDesc, logError);
    };*/

    signal.addListener('offer', (data)=> {
      if (!_this.remoteId) _this.remoteId = data.origin;
      _this.cnxn.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
        // if we received an offer, we need to answer
        if (_this.cnxn.remoteDescription.type == 'offer')
          _this.cnxn.createAnswer(localDesc, logError);
      }, logError);
    });

    signal.addListener('connect', (data)=> {
      if (!_this.remoteId) _this.remoteId = data.origin;
      _this.cnxn.addIceCandidate(new RTCIceCandidate(data.candidate));
      if (!data.candidate) {
        _this.receivedCandidates = true;
        if (_this.attemptConnect) _this.cnxn.createOffer(localDesc, logError);
      }
    });

    signal.addListener('error', (errStr)=> {
      console.log(errStr);
    });

    //stun.l.google.com:19302
  };

  exports.DataChannel = dataChannel;

  provide(exports);
});
