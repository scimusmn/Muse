'use strict';

obtain([], ()=> {

  if (!window.muse.peers) {
    window.muse.peers = [];
  }

  var configuration = {
    iceServers: [{
      urls: 'stun:stun2.l.google.com:19302',
    }, {
      url: 'turn:numb.viagenie.ca',
      credential: 'RTCBook!',
      username: 'ajhg.pub@gmail.com',
    },],
  };

  var createPeer = (info)=> {
    var nCnxn = new RTCPeerConnection(configuration);
    var chan = (info.isClient) ? null : nCnxn.createDataChannel(info.remoteId);
    var peer = {
      cnxn: nCnxn,
      channel: chan,
      id: info.remoteId,
    };
    muse.peers.push(peer);

    peer.onConnect = ()=> {};

    peer.onClose = ()=> {};

    peer.listeners = {};

    peer.addListener = (evt, cb)=> {
      peer.listeners[evt] = cb;
    };

    return peer;
  };

  var dataChannel = function (signal, hostInfo) {
    muse.log('beginning channel monitor');
    var _this = this;

    _this.find = (key, val)=>muse.peers.find(per=>per[key] == val);

    //{cnxn: , channel: , id: }

    //this.cnxn = new RTCPeerConnection(configuration);

    var listeners = {};

    _this.onPeerConnect = (peer)=> {

    };

    var configureChannel = (peer)=> {
      if (!peer.useSignal) {

        peer.channel.onopen = ()=> {
          console.log('opening channel');
          peer.onConnect();

          console.log('calling onPeerConnect');
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
    };

    var setupConnection = (peer)=> {
      peer.cnxn.ondatachannel = (event)=> {
        peer.channel = event.channel;
        configureChannel(peer);
      };

      peer.cnxn.oniceconnectionstatechange = ()=> {
        console.log(peer.cnxn.iceConnectionState);
        if (peer.cnxn.iceConnectionState == 'connected') {
          peer.connected = true;
        }else if (peer.cnxn.iceConnectionState == 'failed' && !peer.connected) {
          muse.log('failed to find candidates, reverting to backup');
          peer.useSignal = true;
          peer.connected = true;
          configureChannel(peer);
        }
      };

      peer.cnxn.onicecandidate = (evt)=> {
        if (evt.candidate) {
          signal.send('cnxn:candidate', {
            from: signal.id,
            to: peer.id,
            candidate: evt.candidate,
          });
        }
      };

    };

    _this.connect = (remoteId)=> {
      var peer = muse.peers.find(per=>per.id == remoteId);
      if (!peer) {
        var newPeer = createPeer({ remoteId: remoteId });
        setupConnection(newPeer);

        configureChannel(newPeer);

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
      var peer = muse.peers.find(per=>per.id == data.from);
      if (peer) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (key in peer.listeners) peer.listeners[key](data[key], data);
          }
        }
      }

    });

    signal.addListener('cnxn:description', (data)=> {
      var peer = muse.peers.find(per=>per.id == data.from);
      console.log('got remote session description:');
      if (!peer) {
        peer = createPeer({ remoteId: data.from, isClient: true });
        setupConnection(peer);
      }

      if (data.hostInfo) peer.info = data.hostInfo;
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
      var peer = muse.peers.find(per=>per.id == data.from);
      if (peer) {
        muse.log(data.candidate);
        peer.cnxn.addIceCandidate(new RTCIceCandidate(data.candidate));
      }

    });

  };

  exports.DataChannel = dataChannel;

  provide(exports);
});
