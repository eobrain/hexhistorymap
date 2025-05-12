import hexes from './hexes.js'
import states from './states.js'

export const cellTreeIndices = cell => {
  const fourHexDigits = cell.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  return {
    base: (int >> 9) & 0x7f,
    index1: (int >> 6) & 0x7
  }
}

const getStateInfo = state => {
  const stateSplit = state.split('/')
  switch (stateSplit.length) {
    case 1:
      return states[state]
    case 2:
      return states[stateSplit[0]].parts[stateSplit[1]]
    default:
      throw new Error(`Invalid state format: ${state}`)
  }
}

export const stateOf = (cell, year) => {
  const { base, index1 } = cellTreeIndices(cell)
  if (!hexes[base] || !hexes[base][index1]) {
    return { place: null, state: '' }
  }
  const parent = hexes[base][index1]
  if (!parent.hexes[cell]) {
    return { place: null, state: '' }
  }
  const place = parent.hexes[cell].place
  const stateNames = [...parent.states, ...parent.hexes[cell].states]
  for (const state of stateNames) {
    const stateInfo = getStateInfo(state)
    if (!stateInfo) {
      throw new Error(`State not found: "${state}"`)
    }
    if (stateInfo.begin <= year && stateInfo.end >= year) {
      return { place, state }
    }
  }
  return { place, state: '' }
}
