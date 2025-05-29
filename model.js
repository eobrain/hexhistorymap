import hexData from './hexes.js'
import stateData from './states.js'
// import hexList from './hex-list.js'

/* global h3 */

class Hex {
  #parent
  #cellCode
  #valid

  constructor (cellCode) {
    this.#cellCode = cellCode
    const fourHexDigits = cellCode.replace(/82(....)fffffffff/, '$1')
    const int = parseInt(fourHexDigits, 16)
    const base = (int >> 9) & 0x7f
    if (!hexData[base]) {
      this.#valid = false
      return
    }
    const index1 = (int >> 6) & 0x7
    this.#parent = hexData[base][index1]
    this.#valid = this.#parent && this.#parent.hexes && this.#parent.hexes[cellCode]
  }

  place () {
    return this.#valid ? this.#parent.hexes[this.#cellCode].place : 'Ocean'
  }

  name () {
    return this.#valid
      ? (this.#parent.hexes[this.#cellCode].name || this.place())
      : 'Ocean'
  }

  stateNames () {
    return this.#valid
      ? [
          ...Object.keys(this.#parent.hexes[this.#cellCode].states || {}),
          ...Object.keys(this.#parent.states || {})
        ]
      : []
  }

  isValid () {
    return this.#valid
  }

  #stateRange (stateName) {
    console.assert(this.#valid, `Invalid hex: ${this.#cellCode}`)
    let { begin, end } = new State(stateName).stateInfo()
    if (this.#parent.states && this.#parent.states[stateName]) {
      const stateInfo = this.#parent.states[stateName]
      if (stateInfo.begin) {
        begin = stateInfo.begin
      }
      if (stateInfo.end) {
        end = stateInfo.end
      }
    }
    if (this.#parent.hexes[this.#cellCode].states && this.#parent.hexes[this.#cellCode].states[stateName]) {
      const stateInfo = this.#parent.hexes[this.#cellCode].states[stateName]
      if (stateInfo.begin) {
        begin = stateInfo.begin
      }
      if (stateInfo.end) {
        end = stateInfo.end
      }
    }
    return {
      stateName,
      begin,
      end
    }
  }

  statesRanges () {
    return this.stateNames().map(stateName => this.#stateRange(stateName))
  }

  coordinates () {
    return h3.cellsToMultiPolygon([this.#cellCode], true)[0]
  }

  latLon () {
    return h3.cellToLatLng(this.#cellCode)
  }

  hasCellCode (cellCode) {
    return this.#cellCode === cellCode
  }

  addCellCodeTo (array) {
    array.push(this.#cellCode)
  }

  url () {
    return `https://h3geo.org/#hex=${this.#cellCode}`
  }
}

const hexesArray = []
for (const base of Object.keys(hexData)) {
  for (const index1 of Object.keys(hexData[base])) {
    const hexes = hexData[base][index1].hexes
    for (const cellCode of Object.keys(hexes)) {
      hexesArray.push(new Hex(cellCode))
    }
  }
}
export const hexes = () => hexesArray

export const locateHex = (lat, lon) => new Hex(h3.latLngToCell(lat, lon, 2))

export const stateCoordinates = (year) => {
  const stateCells = {}
  hexes().forEach(hex => {
    const state = new Milieu(hex, year).state()
    if (state) {
      const stateName = state.name()
      if (!stateCells[stateName]) {
        stateCells[stateName] = []
      }
      hex.addCellCodeTo(stateCells[stateName])
    }
  })
  return Object.fromEntries(
    Object.entries(stateCells).map(([stateName, cells]) => [stateName, h3.cellsToMultiPolygon(cells, true)])
  )
}

export class State {
  #stateName
  constructor (stateName) {
    this.#stateName = stateName
  }

  stateInfo () {
    if (!stateData[this.#stateName]) {
      throw new Error(`State not found: "${this.#stateName}"`)
    }
    return stateData[this.#stateName]
  }

  extantIn (year) {
    const info = this.stateInfo()
    if (!info) {
      throw new Error(`State not found: "${this.#stateName}"`)
    }
    return info.begin <= year && year <= info.end
  }

  name () {
    return this.#stateName || '???'
  }

  centroidLatLon (year) {
    let totLat = 0
    let totLon = 0
    let count = 0
    for (const hex of hexes()) {
      const state = new Milieu(hex, year).state()
      if (state && state.name() === this.#stateName) {
        const [lat, lon] = hex.latLon()
        totLat += lat
        totLon += lon
        count++
      }
    }
    return count > 0 ? [totLat / count, totLon / count] : [0, 0]
  }
}

export const yearRange = () => {
  let minYear = Infinity
  let maxYear = -Infinity
  for (const { begin, end, parts } of Object.values(stateData)) {
    minYear = Math.min(minYear, begin)
    maxYear = Math.max(maxYear, end)
    if (parts) {
      for (const { begin, end } of Object.values(parts)) {
        minYear = Math.min(minYear, begin)
        maxYear = Math.max(maxYear, end)
      }
    }
  }
  return { minYear, maxYear }
}

export class Milieu {
  #hex
  #year
  #place
  #state
  constructor (hex, year) {
    this.#hex = hex
    this.#year = year
    this.#place = this.#hex.place()
    for (const { stateName, begin, end } of this.#hex.statesRanges()) {
      if (begin <= this.#year && this.#year <= end) {
        this.#state = new State(stateName)
        break
      }
    }
  }

  place () {
    return this.#place
  }

  state () {
    return this.#state
  }

  hexName () {
    return this.#hex.name()
  }

  hexUrl () {
    return this.#hex.url()
  }

  coordinates () {
    return this.#hex.coordinates()
  }

  year () {
    return this.#year
  }

  /* cellCode () {
    return this.#hex.cellCode
  } */

  latLon () {
    return this.#hex.latLon()
  }

  inDifferentYear (year) {
    return new Milieu(this.#hex, year)
  }
}
