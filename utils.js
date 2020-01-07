const readline = require('readline')
const fs = require('fs')
const path = require('path')

const config = require('./config')

/**
 * Start a shell `RPC>` which will load any scripts from the `scripts` directory
 * @param {any} wsClient WebSocket client
 */
const startScriptLoaderShell = (wsClient) => {
  let shell = readline.createInterface(process.stdin, process.stdout)
  shell.setPrompt('RPC> ')
  shell.prompt()
  shell.on('line', async line => {
    // A script was asked, read the scripts directory
    const scripts = await fs.promises.readdir(path.resolve(__dirname, 'scripts'))

    // The script was found, run it
    if (scripts.find(x => x.toLowerCase() === line.toLowerCase())) {
      console.log(`Running the script "${line}".`)
      // TODO: loaded script is cached so can't be edited on-the-fly
      const loadedScript = require(path.resolve(__dirname, 'scripts', line))
      loadedScript.run(wsClient)
    }
    else console.log(`The script "${line}" was not found in the "scripts" directory.`)
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
  startScriptLoaderShell,
  pause,
  sendPacket,
  receivePacket
}
