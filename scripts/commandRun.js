const { pause, receivePacket, sendPacket, loadScript, sendPrivateMessage } = require('../utils')

let authorizedPlayers = [
  'Nodejs',
  'Deadly-Attack'
]

const run = async wsClient => {
  // Register a custom listener
  wsClient.on('message', async data => {
    if (!data.startsWith('sniffer_received ')) return

    const packet = data.substring(17)
    // Check if message is in common or private game chat channel
    let isChatMessage = /^cMKF?\|.*?\|(.*?)\|(.*?)\|$/.exec(packet)
    if (isChatMessage) {
      const [, pseudo, message] = isChatMessage

      // Check if player is authorized to run commands
      if (!authorizedPlayers.find(x => x.toLowerCase() === pseudo.toLowerCase()))
        return

      // Check if a run command 
      const isCommand = /^!run (.*?)$/.exec(message)
      if (isCommand) {
        const [, scriptToLoad] = isCommand
        console.log(`Player "${pseudo}" asked to run the command "${scriptToLoad}".`)
        // Tell the player the command is ran
        await sendPrivateMessage(wsClient, pseudo, `Trying to run the script "${scriptToLoad}".`)
        // Can run script without specifying file extension
        await loadScript(wsClient, `${scriptToLoad.replace('.js', '')}.js`)
      }
    }
  })
}

module.exports = { run }
