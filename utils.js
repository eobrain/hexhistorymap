import hexes from './hexes.js'

export const cellTreeIndices = cell => {
  const fourHexDigits = cell.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  return {
    base: (int >> 9) & 0x7f,
    index1: (int >> 6) & 0x7
  }
}

export const treePlace = cell => {
  const { base, index1 } = cellTreeIndices(cell)
  if (!hexes[base] || !hexes[base][index1]) {
    return null
  }
  return hexes[base][index1].hexes[cell].place
}
