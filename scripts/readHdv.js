const { promises: fs } = require('fs')
const path = require('path')

const { sendPacket } = require('../utils')

class HdvOpenSpammer {
  constructor(wsClient) {
    this.isRunning = true
    this.wsClient = wsClient
  }
  async start() {
    for (let i = 0; this.isRunning && i < 6; i++)
      await sendPacket(this.wsClient, `ER11|-${i}`)
  }
  stop() {
    this.isRunning = false
  }
}

const loadHdvCategoryFromStack = (wsClient, categoriesListStack) =>
  sendPacket(wsClient, `EHT${categoriesListStack.pop()}`)

const loadHdvItemPricesFromStack = (wsClient, categoryItemsListStack) =>
  sendPacket(wsClient, `EHl${categoryItemsListStack.pop()}`)

const saveResult = async (hdvReadResult) => {
  const dirPath = path.resolve(__dirname, '..', 'temp')
  // Create dir if not exist
  await fs.mkdir(dirPath, { recursive: true })
  const filePath = path.resolve(dirPath, `hdvPrice_${Date.now()}.json`)
  await fs.writeFile(filePath, JSON.stringify(hdvReadResult, null, 2))
  return filePath
}


const run = async wsClient => {
  // Categories waiting stack
  /* number[] */
  let categoriesListStack = []

  // Category items list waiting stack
  /* number[] */
  let categoryItemsListStack = []

  // HDV final data
  /*
  {
    [itemId: number]: [{
      price: number
    }]
  }
  */
  let hdvReadResult = {}

  // Open HDV
  const hdvOpenSpammer = new HdvOpenSpammer(wsClient)
  hdvOpenSpammer.start()

  // Register a custom listener
  wsClient.on('message', async data => {
    if (!data.startsWith('sniffer_received ')) return
    const packet = data.substring(17)

    // Received HDV open packet
    // ECK11|1,10,100;81,16,17;2.0;1000;20;-3;350
    const isHdvCategoriesListPacket = /^ECK11\|.*?;(.*?);.*$/.exec(packet)
    if (isHdvCategoriesListPacket) {
      // Stop the HDV open spammer
      hdvOpenSpammer.stop()

      const [, categoriesListRaw] = isHdvCategoriesListPacket
      const categoriesList = categoriesListRaw.split(',').map(x => parseInt(x, 10))
      console.log(categoriesList)
      console.log('[HDV_READER] HDV was opened successfully. Reading categories list.')

      // Push the categories list stack
      categoriesListStack.push(...categoriesList)

      // Load the first category
      // await pause(500)
      await loadHdvCategoryFromStack(wsClient, categoriesListStack)
    }


    // Received HDV category items list packet
    // EHL81|1707;7888;1698;6916;1703;1697;6501;1705
    const isHdvCategoryItemsListPacket = /^EHL(.*?)\|(.*?)$/.exec(packet)
    if (isHdvCategoryItemsListPacket) {
      const [, categoryIdRaw, categoryItemsListRaw] = isHdvCategoryItemsListPacket
      const categoryId = parseInt(categoryIdRaw, 10)
      const categoryItemsList = categoryItemsListRaw.split(';').map(x => parseInt(x, 10))
      console.log(`[HDV_READER] Reading items list from category id = ${categoryId}.`)

      categoryItemsListStack.push(...categoryItemsList)

      // await pause(500)
      // Start reading item prices
      await loadHdvItemPricesFromStack(wsClient, categoryItemsListStack)
    }


    // Received HDV items list (prices/statistics) packet
    // EHl6930|16547;7d#14#0#0#0d0+20,b0#7#0#0#0d0+7,f0#2#0#0#0d0+2,f4#3#0#0#0d0+3;31111;;|16552;7d#11#0#0#0d0+17,b0#9#0#0#0d0+9,f0#2#0#0#0d0+2,f4#6#0#0#0d0+6;40000;;|16557;7d#12#0#0#0d0+18,b0#a#0#0#0d0+10,f0#3#0#0#0d0+3,f4#5#0#0#0d0+5;40000;;
    const isHdvItemListPacket = /^EHl(.*?)\|(.*?)$/.exec(packet)
    if (isHdvItemListPacket) {
      const [, itemIdRaw, itemsListRaw] = isHdvItemListPacket
      const itemId = parseInt(itemIdRaw, 10)
      const itemPrices = itemsListRaw.split('|').map(x => x.split(';')).map(x => parseInt(x[x.length - 3], 10))
      console.log(`[HDV_READER] Reading prices for item id = ${itemId}.`)

      // Save the item prices
      hdvReadResult[itemId] = itemPrices.map(x => ({ price: x }))

      // await pause(500)
      // Load the next item prices
      if (categoryItemsListStack.length > 0)
        await loadHdvItemPricesFromStack(wsClient, categoryItemsListStack)
      else {
        // No items left, load the next category
        if (categoriesListStack.length > 0)
          await loadHdvCategoryFromStack(wsClient, categoriesListStack)
        // No categories left, reading finished. Save the final result to file
        else {
          const filePath = await saveResult(hdvReadResult)
          console.log(`[HDV_READER] HDV was fully scanned. Result saved at: "${filePath}".`)
        }
      }
    }
  })
}

module.exports = { run }
