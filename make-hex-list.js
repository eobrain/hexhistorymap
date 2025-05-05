import * as h3 from 'h3-js'
import { geocode } from './geocode.js'
import sleep from './sleep.js'
import isSea from 'is-sea'

async function main () {
  console.log('export default {')

  for (const cell of h3.getRes0Cells()) {
    const [lat, lon] = h3.cellToLatLng(cell)
    if (!isSea(lat, lon)) {
      const place = await geocode(lat, lon)
      await sleep(1000)
      console.log(`  "${cell}": {place: "${place}", lat: ${lat}, lon: ${lon}},`)
    }
  }

  console.log('}')
}

main()
