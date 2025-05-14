import hexData from './hexes.js'
import stateData from './states.js'

const Hex = cellCode => {
  const fourHexDigits = cellCode.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  const base = (int >> 9) & 0x7f
  const index1 = (int >> 6) & 0x7
  const parent = hexData[base] ? hexData[base][index1] : null
  const isValid = () => parent && parent.hexes[cellCode]
  const place = () => isValid() ? parent.hexes[cellCode].place : null
  const stateNames = () => isValid() ? [...parent.states, ...parent.hexes[cellCode].states] : []
  return { isValid, place, stateNames }
}

const State = stateName => {
  const stateSplit = stateName.split('/')
  const stateInfo = () => {
    if (stateSplit.length === 1) {
      return stateData[stateName]
    }
    if (stateSplit.length === 2) {
      return stateData[stateSplit[0]].parts[stateSplit[1]]
    }
    throw new Error(`Invalid state format: ${stateName}`)
  }
  const extantIn = year => {
    const info = stateInfo()
    if (!info) {
      throw new Error(`State not found: "${stateName}"`)
    }
    return info.begin <= year && year <= info.end
  }
  const name = () => stateName
  return { stateInfo, extantIn, name }
}

export const Milieu = (cellCode, year) => {
  const hex = Hex(cellCode)
  // const { base, index1 } = hex.indices()
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
