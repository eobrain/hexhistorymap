// import * as h3 from 'h3-js'
import hexList from './hex-list.js'
import { cellTreeIndices } from './utils.js'

const data = {}

for (const cell in hexList) {
  const { base, index1 } = cellTreeIndices(cell)
  if (!data[base]) {
    data[base] = {}
  }
  if (!data[base][index1]) {
    data[base][index1] = { states: [], hexes: {} }
  }
  data[base][index1].hexes[cell] = { states: [], place: hexList[cell].place }
}
console.log('export default ', JSON.stringify(data, null, 2))
