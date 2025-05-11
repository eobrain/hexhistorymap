import hexes from './hexes.js'

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
    return { place: null, state: null }
  }
  const parent = hexes[base][index1]
  const place = parent.hexes[cell].place
  const states = [...parent.states, ...parent.hexes[cell].states]
  const state = states.length === 0 ? null : states[0]
  return { place, state }
}
