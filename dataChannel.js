'use strict';

obtain([], ()=> {
  var dataChannel = function (signal) {
    console.log('creating new data channel');
    var _this = this;

    var configuration = {
      iceServers: [{
        urls: 'stun:stun2.l.google.com:19302',
      }, {
        url: 'turn:numb.viagenie.ca',
        credential: 'RTCBook!',
        username: 'ajhg.pub@gmail.com',
      }, ],
    };

    this.cnxn = new RTCPeerConnection(configuration);

    var listeners = {};

    _this.onConnect = ()=> {};

    _this.onClose = ()=> {};

    _this.addListener = (evt, cb)=> {
      listeners[evt] = cb;
    };

    var getChannel = (channel)=> {
      console.log('getting channel');

      if (channel != signal) {
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
      } else {
        _this.channel = {};

        signal.addListener('relay', (data)=> {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              if (key in listeners) listeners[key](data[key], data);
            }
          }
        });

        _this.send = (data)=> {
          signal.send({ relay: {
            toId: _this.remoteId,
            data: data,
          }, });
        };

        _this.onConnect();
      }
    };

    _this.connect = (remoteId)=> {
      _this.remoteId = remoteId;
      getChannel(this.cnxn.createDataChannel('channelName'));

      //_this.cnxn.onnegotiationneeded = function () {
      _this.cnxn.createOffer().then(localDesc).catch(logError);
      //};

      _this.initiator = true;
    };

    function logError(error) {
      console.log(error.name + ': ' + error.message);
    }

    _this.cnxn.ondatachannel = (event)=> {
      console.log('got data channel');
      getChannel(event.channel);
    };

    _this.cnxn.oniceconnectionstatechange = ()=> {
      console.log(_this.cnxn.iceConnectionState);
      if (_this.cnxn.iceConnectionState == 'connected') {
        _this.connected = true;
      }else if (_this.cnxn.iceConnectionState == 'failed' && !_this.connected) {
        console.log('failed to find candidates, reverting to backup');
        _this.useSignal = true;
        _this.connected = true;
        getChannel(signal);
      }
    };

    _this.cnxn.onicecandidate = (evt)=> {
      //console.log('found ice candidate:');
      //console.log(evt && evt.candidate);
      if (evt.candidate)
        signal.send({ connect: {
          origin: signal.id,
          target: _this.remoteId,
          candidate: evt.candidate,
        }, });
    };

    var localDesc = (desc)=> {
      _this.cnxn.setLocalDescription(desc)
        .then(()=> {
          console.log('sending local description:');
          console.log(_this.cnxn.localDescription);
          signal.send({ offer: {
            origin: signal.id,
            target: _this.remoteId,
            sdp: _this.cnxn.localDescription,
          }, });
        })
        .catch(logError);
    };

    /*_this.cnxn.onnegotiationneeded = function () {
      _this.cnxn.createOffer(localDesc, logError);
    };*/

    signal.addListener('offer', (data)=> {
      console.log('got remote description:');
      console.log(data);
      if (!_this.remoteId) _this.remoteId = data.origin;
      _this.cnxn.setRemoteDescription(new RTCSessionDescription(data.sdp))
      .then(()=> {
        // if we received an offer, we need to answer
        if (_this.cnxn.remoteDescription.type == 'offer') {
          console.log('creating answer');
          _this.cnxn.createAnswer().then(localDesc).catch(logError);
        }
      })
      .catch(logError);
    });

    signal.addListener('connect', (data)=> {
      console.log('Received ICE candidate:');
      console.log(data.candidate);
      _this.cnxn.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    //stun.l.google.com:19302
  };

  exports.DataChannel = dataChannel;

  provide(exports);
});
