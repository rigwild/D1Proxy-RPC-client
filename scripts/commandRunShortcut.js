const { pause, receivePacket, sendPacket, loadScript, sendPrivateMessage } = require('../utils')

const shortcuts = [
  { packet: 'OU35969340|', script: 'turn' },
  { packet: 'OU35970076|', script: 'talk.js' },
  { packet: 'OU35995799|', script: 'throwBooks.js' }
]

const run = async wsClient => {
  // Register a custom listener
  wsClient.on('message', async data => {
    if (!data.startsWith('sniffer_sent ')) return

    const packet = data.substring(13)

    const foundShortcut = shortcuts.find(x => x.packet === packet)
    if (foundShortcut) await loadScript(wsClient, `${foundShortcut.script.replace('.js', '')}.js`)
  })
}

module.exports = { run }
