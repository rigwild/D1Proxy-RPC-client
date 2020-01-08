const { sendPacket, randomStrFour } = require('./common')

/**
 * 
 * @param {any} wsClient WebSocket client
 * @param {string} pseudo Recipient pseudo
 * @param {string} message Message content
 * @param {boolean} shouldIncludeRandom Add a random string at the end of the message
 */
const sendPrivateMessage = (wsClient, pseudo, message, shouldIncludeRandom = true) =>
  sendPacket(wsClient, `BM${pseudo}|${message}${shouldIncludeRandom ? ` [${randomStrFour()}]` : ''}|`)

module.exports = {
  sendPrivateMessage
}
