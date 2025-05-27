import * as h3 from 'h3-js'
import { geocode } from './geocode.js'
import sleep from './sleep.js'
import isSea from 'is-sea'
import prevHexes from './hex-list.js'
// import { pp } from 'passprint'

const res0hexes = h3.getRes0Cells()
const hexes = res0hexes.map(hex => h3.cellToChildren(hex, 2)).flat()

const landCount = (cell) => {
  let count = 0
  for (const child of h3.cellToChildren(cell, 3)) {
    if (!isSea(...h3.cellToLatLng(child))) {
      count++
    }
  }
  return count
}

async function main () {
  console.log('export default {')

  for (const cell of hexes) {
    let { place, lat, lon } = prevHexes[cell] || {}
    if (!place) {
      [lat, lon] = h3.cellToLatLng(cell)
    }
    const land = landCount(cell)
    if (land >= 2) {
      if (!place || place === 'Error') {
        place = await geocode(lat, lon)
        await sleep(1000)
      }
      console.log(` "${cell}": {`)
      console.log(`  place: "${place}",`)
      console.log(`  land: ${land},`)
      console.log(`  lon: ${lon},`)
      console.log(`  lat: ${lat},`)
      console.log(' },')
    }
  }

  console.log('}')
}

main()
