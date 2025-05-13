import hexList from './hex-list.js'
// import states from './states.js'
import { select } from 'https://esm.sh/d3-selection'
import { geoPath, geoAzimuthalEqualArea, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'
import { Milieu } from './utils.js'
import MurmurHash3 from 'https://esm.sh/imurmurhash'

/* global h3 */

const year = 2025

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const hexFeatures = Object.entries(hexList).map(([cell, { lat, lon, place }]) => {
  const coordinates = h3.cellsToMultiPolygon([cell], true)[0]
  const state = Milieu(cell, year).state()
  return {
    type: 'Feature',
    properties: { cell, place, state },
    geometry: {
      type: 'Polygon',
      coordinates
    }
  }
})

const canvas = select('#content canvas').node()
const context = canvas.getContext('2d')

const projection = geoAzimuthalEqualArea().fitSize([800, 800], geojson)

const geoGenerator = geoPath()
  .projection(projection)
  .pointRadius(6.7)
  .context(context)

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

// hexList
context.beginPath()
geoGenerator({ type: 'FeatureCollection', features: hexFeatures })
context.stroke()

const saturation = 50
const lightness = 50
hexFeatures.forEach(feature => {
  context.beginPath()
  geoGenerator(feature)
  if (feature.properties.state) {
    const hue = Math.floor(MurmurHash3(feature.properties.state).result() % 360)
    context.strokeStyle = `hsl(${hue} ${saturation}% ${lightness}%)`
  } else {
    context.strokeStyle = 'white'
  }
  context.stroke()
})

const $popup = document.getElementById('popup')

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const point = projection.invert([x, y])
  const [lon, lat] = point
  const cell = h3.latLngToCell(lat, lon, 2)
  const milieu = Milieu(cell, year)
  if (milieu.place()) {
    $popup.style.display = 'block'
    $popup.style.left = `${event.clientX}px`
    $popup.style.top = `${event.clientY}px`
    $popup.innerHTML = `<div>${milieu.place()}</div><div>${milieu.state()}</div>`
  }
})
