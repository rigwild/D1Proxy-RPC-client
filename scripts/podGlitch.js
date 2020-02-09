const { pause, receivePacket, sendPacket } = require('../utils')

const availablePods = 7315
const itemId = 30471525

const buyBooks = async wsClient => {
  // Open window
  await sendPacket(wsClient, `ER0|-2`)

  // Buy books
  await sendPacket(wsClient, `EB7940|${availablePods}`)

  // Close window
  await sendPacket(wsClient, `EV`)
}

const throwBooks = (wsClient, currentBooks) => sendPacket(wsClient, `OD${itemId}|${currentBooks}`)

const run = async wsClient => {
  // Nombre de livre sur soi
  let currentBooks = 584000
  let isFirstTurn = true

  while (true) {
    // if (!isFirstTurn) // <--- A commenter si déjà des livres sur soi
    await throwBooks(wsClient, currentBooks)

    console.log(1, currentBooks)
    await buyBooks(wsClient)
    currentBooks += availablePods

    if (isFirstTurn && currentBooks === 0) {
      await throwBooks(wsClient, currentBooks)

      console.log(2, currentBooks)

      await buyBooks(wsClient)
      currentBooks += availablePods
    }

    // Move forward
    await sendPacket(wsClient, `GA001dfK`)
    await pause(1000)

    // Turn back
    await sendPacket(wsClient, `eD7`)
    // await pause(1000)

    console.log(3, currentBooks)

    await throwBooks(wsClient, currentBooks)

    await buyBooks(wsClient)
    currentBooks += availablePods

    console.log(4, currentBooks)

    // Move backward
    await sendPacket(wsClient, `GA001hfw`)
    await pause(1000)

    // Turn
    await sendPacket(wsClient, `eD3`)
    isFirstTurn = false
  }
}

module.exports = { run }
