import hexes from './hex-list.js'
import { select } from 'https://esm.sh/d3-selection'
import { geoPath, geoOrthographic, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const hexFeatures = Object.entries(hexes).map(([cell, { lat, lon, place }]) => {
  // const [x, y] = h3.cellToPolar(cell)
  return {
    type: 'Feature',
    properties: { name: place },
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
    }
  }
})

window.setInterval(update, 100)

const context = select('#content canvas')
  .node()
  .getContext('2d')

const projection = geoOrthographic()
  .scale(300)

const geoGenerator = geoPath()
  .projection(projection)
  .pointRadius(4)
  .context(context)

let yaw = 300

function update () {
  projection.rotate([yaw, -45])

  context.clearRect(0, 0, 800, 600)

  context.lineWidth = 0.5
  context.strokeStyle = '#333'

  context.beginPath()
  geoGenerator({ type: 'FeatureCollection', features: geojson.features })
  context.stroke()

  // Graticule
  const graticule = geoGraticule()
  context.beginPath()
  context.strokeStyle = '#ccc'
  geoGenerator(graticule())
  context.stroke()

  // hexes
  context.beginPath()
  geoGenerator({ type: 'FeatureCollection', features: hexFeatures })
  context.stroke()

  yaw -= 0.2
}
