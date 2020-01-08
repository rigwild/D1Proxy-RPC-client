const readline = require('readline')
const fs = require('fs')
const path = require('path')

const { sendPacket, receivePacket } = require('./common')

/**
 * Load any script from the `scripts` directory.
 * Removes script cache everytime so scripts can be edited without restarting process.
 * @param {any} wsClient WebSocket client
 * @param {string} scriptName Name of the script to run
 * @returns {void}
 */
const loadScript = async (wsClient, scriptName) => {
  // Read the scripts directory
  const scripts = await fs.promises.readdir(path.resolve(__dirname, '..', 'scripts'))

  // Search if it exists then run it
  if (scripts.find(x => x.toLowerCase() === scriptName.toLowerCase())) {
    console.log(`Running the script "${scriptName}".`)
    const loadedScriptPath = path.resolve(__dirname, '..', 'scripts', scriptName)
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

    // Check if run command
    if (line.startsWith('run ')) await loadScript(wsClient, line.substring(4))
    else if (line.startsWith('send ')) await sendPacket(wsClient, line.substring(5))
    else if (line.startsWith('receive ')) await receivePacket(wsClient, line.substring(8))
    shell.prompt()
  }).on('close', () => process.exit(0))
}

module.exports = {
  loadScript,
  startScriptLoaderShell
}
