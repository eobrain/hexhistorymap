import hexData from './hexes.js'
import stateData from './states.js'
import hexList from './hex-list.js'

/* global h3 */

const Hex = cellCode => {
  const fourHexDigits = cellCode.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  const base = (int >> 9) & 0x7f
  const index1 = (int >> 6) & 0x7
  const parent = hexData[base] ? hexData[base][index1] : null
  const isValid = () => parent && parent.hexes[cellCode]
  const place = () => isValid() ? parent.hexes[cellCode].place : null
  const stateNames = () => isValid() ? [...parent.states || [], ...parent.hexes[cellCode].states || []] : []
  const coordinates = () => h3.cellsToMultiPolygon([cellCode], true)[0]
  const latLon = () => h3.cellToLatLng(cellCode)

  return { isValid, place, stateNames, coordinates, cellCode, latLon }
}

export const locateHex = (lat, lon) => Hex(h3.latLngToCell(lat, lon, 2))

export const hexes = () => Object.keys(hexList).map(cell => Hex(cell))

export const stateCoordinates = (year) => {
  const stateCells = {}
  hexes().forEach(hex => {
    const state = Milieu(hex, year).state()
    if (state) {
      const stateName = state.name()
      if (!stateCells[stateName]) {
        stateCells[stateName] = []
      }
      stateCells[stateName].push(hex.cellCode)
    }
  })
  return Object.fromEntries(
    Object.entries(stateCells).map(([stateName, cells]) => [stateName, h3.cellsToMultiPolygon(cells, true)])
  )
}

export const State = stateName => {
  const stateInfo = () => {
    if (!stateData[stateName]) {
      throw new Error(`State not found: "${stateName}"`)
    }
    return stateData[stateName]
  }
  const extantIn = year => {
    const info = stateInfo()
    if (!info) {
      throw new Error(`State not found: "${stateName}"`)
    }
    return info.begin <= year && year <= info.end
  }
  const name = () => stateName || '???'
  return { stateInfo, extantIn, name }
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

export const Milieu = (hex, year) => {
  let place = null
  let state = null
  if (hex.isValid()) {
    place = hex.place()
    for (const stateName of hex.stateNames()) {
      state = State(stateName)
      if (state.extantIn(year)) {
        break
      }
      state = null
    }
  }
  return {
    place: () => place,
    state: () => state
  }
}
