const serverIp = '127.0.0.1'
const serverPort = '8769'
const serverURI = `ws://${serverIp}:${serverPort}`

const packetDelayMs = 100

module.exports = {
  serverIp,
  serverPort,
  serverURI,
  packetDelayMs
}
