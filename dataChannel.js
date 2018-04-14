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
          //_this.peers = _this.peers.filter(per=>per.id != peer.id);
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
      peer.cnxn.ondatachannel = (event)=> {
        muse.log('got data channel');
        onNewPeer(peer);
      };

      peer.cnxn.oniceconnectionstatechange = ()=> {
        console.log(cnxn.iceConnectionState);
        if (peer.cnxn.iceConnectionState == 'connected') {
          peer.connected = true;
        }else if (peer.cnxn.iceConnectionState == 'failed' && !peer.connected) {
          muse.log('failed to find candidates, reverting to backup');
          peer.useSignal = true;
          peer.connected = true;
          onNewPeer(peer);
        }
      };

      peer.cnxn.onicecandidate = (evt)=> {
        if (evt.candidate) {
          console.log('sending candidate');
          signal.send('cnxn:candidate', {
            from: signal.id,
            to: peer.id,
            candidate: evt.candidate,
          });
        }
      };

    };

    _this.connect = (remoteId)=> {
      var peer = _this.peers.find(per=>per.id == remoteId);
      if (!peer) {
        var newPeer = {
          cnxn: new RTCPeerConnection(configuration),
          channel: this.cnxn.createDataChannel(remoteId),
          id: remoteId,
        };
        _this.peers.push(newPeer);

        onNewPeer(newPeer);

        console.log(_this.peers);

        newPeer.cnxn.createOffer().then((desc)=> {
          return localDesc(desc, newPeer);
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
          console.log('sending local description:');
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
        console.log('making new connection');
        peer = {
          cnxn: new RTCPeerConnection(configuration),
          channel: this.cnxn.createDataChannel(data.from),
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
          peer.cnxn.createAnswer().then((desc)=> {
            return localDesc(desc, peer);
          }).catch(logError);
        }
      })
      .catch(logError);

    });

    signal.addListener('cnxn:candidate', (data)=> {
      console.log('got an ICE candidate');
      var peer = _this.peers.find(per=>per.id == data.from);
      if (peer) {
        console.log('Received ICE candidate:');
        muse.log(data.candidate);
        peer.cnxn.addIceCandidate(new RTCIceCandidate(data.candidate));
      }

    });

  };

  exports.DataChannel = dataChannel;

  provide(exports);
});
