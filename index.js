const WebSocket = require('ws')

const config = require('./config')
const { startScriptLoaderShell } = require('./utils')

const ws = new WebSocket(config.serverURI)

ws.on('open', async () => {
  ws.send('hello')
  startScriptLoaderShell(ws)
})

ws.on('message', data => {
  // Log sniffing data
  if (data.startsWith('sniffer_received ')) {
    const packet = data.substring(17)
    console.log(`[SNIFFER][RECEIVED] ${packet}`)
  }
  else if (data.startsWith('sniffer_sent ')) {
    const packet = data.substring(13)
    console.log(`[SNIFFER][__SENT__] ${packet}`)
  }
  else if (data.startsWith('sent ')) {
    const packet = data.substring(5)
    console.log(`[__RPC__][__SENT__] ${packet}`)
  }
  else if (data.startsWith('received ')) {
    const packet = data.substring(13)
    console.log(`[__RPC__][RECEIVED] ${packet}`)
  }
  else if (data === 'hello') console.log(`[SNIFFER][INIT] Sniffer connected successfully`)
  else console.log(`[SNIFFER][UNKNOWN] ${data}`)
})
