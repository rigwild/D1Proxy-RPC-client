const { pause, receivePacket, sendPacket } = require('../utils')

const itemId = 35568769

const throwBook = wsClient => sendPacket(wsClient, `OD${itemId}|1`)

const run = async wsClient => {
  await throwBook(wsClient)
  await throwBook(wsClient)
  await throwBook(wsClient)
  await throwBook(wsClient)
}

module.exports = { run }
