const config = require('../config')

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
  pause,
  sendPacket,
  receivePacket
}
