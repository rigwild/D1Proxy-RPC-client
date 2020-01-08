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
    console.log(`[SNIFFER][SENT____] ${packet}`)
  }
  else if (data === 'hello') console.log(`[SNIFFER][INIT] Sniffer connected successfully`)
  else console.log(`[SNIFFER][UNKNOWN] ${data}`)
})
