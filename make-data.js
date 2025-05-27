// import * as h3 from 'h3-js'
import hexList from './hex-list.js'
import hexData from './hexes.js'

class Hex {
  #parent
  #cellCode

  constructor (cellCode) {
    this.#cellCode = cellCode
    const fourHexDigits = cellCode.replace(/82(....)fffffffff/, '$1')
    const int = parseInt(fourHexDigits, 16)
    const base = (int >> 9) & 0x7f

    if (!hexData[base]) {
      hexData[base] = {}
    }
    const index1 = (int >> 6) & 0x7

    if (!hexData[base][index1]) {
      hexData[base][index1] = { hexes: {}, states: {} }
    }

    this.#parent = hexData[base][index1]

    if (!this.#parent.hexes[cellCode]) {
      this.#parent.hexes[cellCode] = { place: hexList[cellCode].place, states: {} }
    }
    this.#parent.hexes[cellCode].land = hexList[cellCode].land
  }

  dumpAllHexes () {
    console.log('export default ', JSON.stringify(hexData, null, 2))
  }
}

let hex
for (const cellCode in hexList) {
  hex = new Hex(cellCode)
}
hex.dumpAllHexes()
