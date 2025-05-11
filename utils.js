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
    const stateInfo = states[state]
    if (stateInfo.begin <= year && stateInfo.end >= year) {
      return { place, state }
    }
  }
  return { place, state: '' }
}
