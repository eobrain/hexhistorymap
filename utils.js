import hexData from './hexes.js'
import stateData from './states.js'

const Hex = cellCode => {
  const fourHexDigits = cellCode.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  const base = (int >> 9) & 0x7f
  const index1 = (int >> 6) & 0x7
  return {
    indices: () => {
      return { base, index1 }
    }
  }
}

const State = stateName => {
  const stateSplit = stateName.split('/')
  return {
    stateInfo: () => {
      if (stateSplit.length === 1) {
        return stateData[stateName]
      }
      if (stateSplit.length === 2) {
        return stateData[stateSplit[0]].parts[stateSplit[1]]
      }
      throw new Error(`Invalid state format: ${stateName}`)
    }
  }
}

export const Milieu = (cellCode, year) => {
  const { base, index1 } = Hex(cellCode).indices()
  let place = null
  let state = ''
  if (hexData[base] && hexData[base][index1]) {
    const parent = hexData[base][index1]
    if (parent.hexes[cellCode]) {
      place = parent.hexes[cellCode].place
      const stateNames = [...parent.states, ...parent.hexes[cellCode].states]
      for (const stateName of stateNames) {
        const stateInfo = State(stateName).stateInfo()
        if (!stateInfo) {
          throw new Error(`State not found: "${stateName}"`)
        }
        if (stateInfo.begin <= year && stateInfo.end >= year) {
          state = stateName
        }
      }
    }
  }
  return {
    place: () => place,
    state: () => state
  }
}
