const WebSocket = require('ws')

const config = require('./config')
const { startScriptLoaderShell, loadScript } = require('./utils')

const ws = new WebSocket(config.serverURI)

ws.on('open', () => {
  ws.send('hello')
  startScriptLoaderShell(ws)
})

ws.on('message', async data => {
  // Log sniffing data
  if (data.startsWith('sniffer_received ')) console.log(`[SNIFFER][RECEIVED] ${data.substring(17)}`)
  else if (data.startsWith('sniffer_sent ')) console.log(`[SNIFFER][__SENT__] ${data.substring(13)}`)
  else if (data.startsWith('received ')) console.log(`[__RPC__][RECEIVED] ${data.substring(13)}`)
  else if (data.startsWith('sent ')) console.log(`[__RPC__][__SENT__] ${data.substring(5)}`)
  else if (data === 'hello') console.log(`[SNIFFER][INIT] Sniffer connected successfully`)
  else console.log(`[SNIFFER][UNKNOWN_] ${data}`)
})
