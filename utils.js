const readline = require('readline')
const fs = require('fs')
const path = require('path')

const config = require('./config')

/**
 * Load any script from the `scripts` directory.
 * Removes script cache everytime so scripts can be edited without restarting process.
 * @param {any} wsClient WebSocket client
 * @param {string} scriptName Name of the script to run
 * @returns {void}
 */
const loadScript = async (wsClient, scriptName) => {
  // Read the scripts directory
  const scripts = await fs.promises.readdir(path.resolve(__dirname, 'scripts'))

  // Search if it exists then run it
  if (scripts.find(x => x.toLowerCase() === scriptName.toLowerCase())) {
    console.log(`Running the script "${scriptName}".`)
    const loadedScriptPath = path.resolve(__dirname, 'scripts', scriptName)
    delete require.cache[loadedScriptPath]
    require(loadedScriptPath).run(wsClient)
  }
  else console.log(`The script "${scriptName}" was not found in the "scripts" directory.`)
}

/**
 * Start a shell `RPC>` which will load any scripts from the `scripts` directory.
 * 
 * Removes script cache everytime so scripts can be edited without restarting process.
 * @param {any} wsClient WebSocket client
 * @returns {void}
 */
const startScriptLoaderShell = wsClient => {
  let shell = readline.createInterface(process.stdin, process.stdout)
  shell.setPrompt('RPC> ')
  shell.prompt()
  shell.on('line', async line => {
    if (!line) return shell.prompt()
    await loadScript(wsClient, line)
    shell.prompt()
  }).on('close', () => process.exit(0))
}


/**
 * Pause execution
 * @param {number} ms Number of milliseconds to wait
 */
const pause = ms => new Promise(res => setTimeout(res, ms))

/**
 * RPC call
 * @param {any} wsClient WebSocket client
 * @param {string[]} packetList List of packets to send
 * @param {number} delayBetweenPackets Delay between each packet sending
 */
const call = (wsClient, command, packet, delayBetweenPackets = config.packetDelayMs) => {
  wsClient.send(`${command} ${packet}`)
  return pause(delayBetweenPackets)
}

/**
 * RPC ask to send a packet
 * @param {any} wsClient WebSocket client
 * @param {string[]} packetList List of packets to send
 * @param {number} delayBetweenPackets Delay between each packet sending
 */
const sendPacket = (wsClient, packet, delayBetweenPackets = config.packetDelayMs) =>
  call(wsClient, 'send', packet, delayBetweenPackets)

/**
 * RPC ask to receive a packet
 * @param {any} wsClient WebSocket client
 * @param {string[]} packetList List of packets to send
 * @param {number} delayBetweenPackets Delay between each packet sending
 */
const receivePacket = (wsClient, packet, delayBetweenPackets = config.packetDelayMs) =>
  call(wsClient, 'receive', packet, delayBetweenPackets)

module.exports = {
  loadScript,
  startScriptLoaderShell,
  pause,
  sendPacket,
  receivePacket
}
