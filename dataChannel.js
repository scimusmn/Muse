'use strict';

obtain([], ()=> {
  var dataChannel = function (signal, hostInfo) {
    muse.log('beginning channel monitor');
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

    _this.peers = [];

    _this.find = (key, val)=>_this.peers.find(per=>per[key] == val);

    //{cnxn: , channel: , id: }

    this.cnxn = new RTCPeerConnection(configuration);

    var listeners = {};

    _this.onPeerConnect = (peer)=> {

    };

    var onNewPeer = (peer)=> {
      peer.onConnect = ()=> {};

      peer.onClose = ()=> {};

      peer.listeners = {};

      peer.addListener = (evt, cb)=> {
        peer.listeners[evt] = cb;
      };

      if (!peer.useSignal) {

        peer.channel.onopen = ()=> {
          peer.onConnect();

          _this.onPeerConnect(peer);
        };

        peer.channel.onclose = ()=> {
          peer.onClose();
          _this.peers = _this.peers.filter(per=>per.id != peer.id);
        };

        peer.channel.onmessage = function (evt) {
          var data = JSON.parse(evt.data);
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              if (key in peer.listeners) peer.listeners[key](data[key], data);
            }
          }
        };

        peer.send = (msg, data)=> {
          if (typeof msg == 'string') msg = { [msg]: data };
          peer.channel.send(JSON.stringify(msg));
        };
      } else {

        peer.send = (data)=> {
          signal.send('cnxn:relay', {
            to: peer.id,
            from: signal.id,
            data: data,
          });
        };

        peer.onConnect();
      }

      return peer;
    };

    var setupConnection = (peer)=> {
      var cnxn = peer.cnxn;
      cnxn.ondatachannel = (event)=> {
        muse.log('got data channel');
        onNewChannel(peer);
      };

      cnxn.oniceconnectionstatechange = ()=> {
        muse.log(cnxn.iceConnectionState);
        if (cnxn.iceConnectionState == 'connected') {
          peer.connected = true;
        }else if (cnxn.iceConnectionState == 'failed' && !peer.connected) {
          muse.log('failed to find candidates, reverting to backup');
          peer.useSignal = true;
          peer.connected = true;
          onNewChannel(peer);
        }
      };

      cnxn.onicecandidate = (evt)=> {
        if (evt.candidate)
          signal.send('cnxn:candidate', {
            from: signal.id,
            to: peer.remoteId,
            candidate: evt.candidate,
          });
      };

    };

    _this.connect = (remoteId)=> {
      var peer = _this.peers.find(per=>per.id == remoteId);
      if (!peer) {
        var newCnxn = new RTCPeerConnection(configuration);
        var newPeer = {
          cnxn: newCnxn,
          channel: newCnxn.createDataChannel(remoteId),
          id: remoteId,
        };

        _this.peers.push(newPeer);

        onNewPeer(newPeer);

        newPeer.cnxn.createOffer().then((desc)=> {
          localDesc(desc, newPeer);
        }).catch(logError);

        return newPeer;
      } else return peer;
    };

    function logError(error) {
      muse.log(error.name + ': ' + error.message);
    }

    var localDesc = (desc, peer)=> {
      peer.cnxn.setLocalDescription(desc)
        .then(()=> {
          muse.log('sending local description:');
          muse.log(peer.cnxn.localDescription);
          signal.send('cnxn:description', {
            from: signal.id,
            to: peer.id,
            hostInfo: hostInfo,
            sdp: peer.cnxn.localDescription,
          });
        })
        .catch(logError);
    };

    signal.addListener('cnxn:relay', (data)=> {
      var peer = _this.peers.find(per=>per.id == data.from);
      if (peer) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (key in peer.listeners) peer.listeners[key](data[key], data);
          }
        }
      }

    });

    signal.addListener('cnxn:description', (data)=> {
      var peer = _this.peers.find(per=>per.id == data.from);
      console.log('got remote session description:');
      muse.log(data);
      if (!peer) {
        var newCnxn = new RTCPeerConnection(configuration);
        peer = {
          cnxn: newCnxn,
          channel: newCnxn.createDataChannel(data.from),
          id: data.from,
        };
      }

      if (data.hostInfo) peer.info = data.hostInfo;
      //if (!peer.id) peer.id = data.from;
      peer.cnxn.setRemoteDescription(new RTCSessionDescription(data.sdp))
      .then(()=> {
        // if we received an offer, we need to answer
        if (peer.cnxn.remoteDescription.type == 'offer') {
          console.log('creating answer');
          peer.cnxn.createAnswer().then(localDesc).catch(logError);
        }
      })
      .catch(logError);

    });

    signal.addListener('cnxn:candidate', (data)=> {
      var peer = _this.peers.find(per=>per.id == data.from);
      if (peer) {
        muse.log('Received ICE candidate:');
        muse.log(data.candidate);
        peer.cnxn.addIceCandidate(new RTCIceCandidate(data.candidate));
      }

    });

  };

  exports.DataChannel = dataChannel;

  provide(exports);
});
