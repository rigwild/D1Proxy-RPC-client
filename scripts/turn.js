const { pause, receivePacket, sendPacket } = require('../utils')

const run = async wsClient => {
  // Turn your player
  for (let i = 0; i <= 8; i++)
    await sendPacket(wsClient, `eD${i}`)
}

module.exports = { run }
