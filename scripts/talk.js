const { pause, receivePacket, sendPacket } = require('../utils')

const run = async wsClient => {
  await sendPacket(wsClient, `BM*|Hello|`)
  await sendPacket(wsClient, `BM*|dofus|`)
  await sendPacket(wsClient, `BM*|nodejs|`)
}

module.exports = { run }
