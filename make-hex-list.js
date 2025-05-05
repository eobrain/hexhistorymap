import * as h3 from 'h3-js'
import { geocode } from './geocode.js'
import sleep from './sleep.js'
import isSea from 'is-sea'
import prevHexes from './hex-list.js'

const res0hexes = h3.getRes0Cells()
const hexes = res0hexes.map(hex => h3.cellToChildren(hex, 2)).flat()

async function main () {
  console.log('export default {')

  for (const cell of hexes) {
    let { place, lat, lon } = prevHexes[cell] || {}
    if (!place) {
      [lat, lon] = h3.cellToLatLng(cell)
    }
    if (!isSea(lat, lon)) {
      // const shape = h3.cellsToMultiPolygon([cell], true)[0][0]
      if (!place) {
        place = await geocode(lat, lon)
        await sleep(1000)
      }
      console.log(` "${cell}": {`)
      console.log(`  place: "${place}",`)
      console.log(`  lon: ${lon},`)
      console.log(`  lat: ${lat},`)
      // console.log(`  shape: ${JSON.stringify(shape)}},`)
      console.log(' },')
    }
  }

  console.log('}')
}

main()
