const { pause, receivePacket, sendPacket, loadScript, sendPrivateMessage } = require('../utils')

const run = async wsClient => {
  // Register a custom listener
  wsClient.on('message', async data => {
    if (!data.startsWith('sniffer_received ')) return

    const packet = data.substring(17)
    // Check if packet is fight start
    let isFightStart = /^GA;0$/.exec(packet)
    if (isFightStart) {
      // Set fight ready after 3 seconds
      await pause(3000)
      await sendPacket(wsClient, 'GR1')
    }
  })
}

module.exports = { run }

