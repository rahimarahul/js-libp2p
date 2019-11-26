'use strict'

const Libp2p = require('./src')
const { MULTIADDRS_WEBSOCKETS } = require('./test/fixtures/browser')
const Peers = require('./test/fixtures/peers')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const WebSockets = require('libp2p-websockets')
const Muxer = require('libp2p-mplex')
const Crypto = require('libp2p-secio')
const pipe = require('it-pipe')
let libp2p

const before = async () => {
  // Use the last peer
  const peerId = await PeerId.createFromJSON(Peers[Peers.length - 1])
  const peerInfo = new PeerInfo(peerId)
  peerInfo.multiaddrs.add(MULTIADDRS_WEBSOCKETS[0])

  libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [WebSockets],
      streamMuxer: [Muxer],
      connEncryption: [Crypto]
    }
  })
  // Add the echo protocol
  libp2p.handle('/echo/1.0.0', ({ stream }) => pipe(stream, stream))

  await libp2p.start()
}

const after = async () => {
  await libp2p.stop()
}

module.exports = {
  bundlesize: { maxSize: '220kB' },
  hooks: {
    pre: before,
    post: after
  }
}
