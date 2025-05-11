// import * as h3 from 'h3-js'
import hexList from './hex-list.js'

const data = {}

for (const cell in hexList) {
  const fourHexDigits = cell.replace(/82(....)fffffffff/, '$1')
  const int = parseInt(fourHexDigits, 16)
  const base = (int >> 9) & 0x7f
  const index1 = (int >> 6) & 0x7
  if (!data[base]) {
    data[base] = {}
  }
  if (!data[base][index1]) {
    data[base][index1] = { states: [], hexes: {} }
  }
  data[base][index1].hexes[cell] = { states: [], place: hexList[cell].place }
}
console.log('export default ', JSON.stringify(data, null, 2))
