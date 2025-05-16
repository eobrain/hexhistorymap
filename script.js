import { select } from 'https://esm.sh/d3-selection'
import { geoPath, geoAzimuthalEqualArea, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'
import { Milieu, hexes, locateHex, yearRange } from './model.js'
import MurmurHash3 from 'https://esm.sh/imurmurhash'

/* global $yearControl, $yearDisplay */

const { minYear, maxYear } = yearRange()
let year = maxYear

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const hexFeatures = hexes().map(hex => {
  const coordinates = hex.coordinates()
  return {
    type: 'Feature',
    properties: { hex },
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

/*context.beginPath()
geoGenerator({ type: 'FeatureCollection', features: geojson.features })
context.stroke()*/

// Graticule
/*const graticule = geoGraticule()
context.beginPath()
context.strokeStyle = '#ccc'
geoGenerator(graticule())
context.stroke()*/

// hexList
/*
context.beginPath()
geoGenerator({ type: 'FeatureCollection', features: hexFeatures })
context.stroke()
*/

const saturation = 50
const lightness = 50

const update = () => {
  $yearDisplay.innerHTML = yearFormat($yearControl.value)
  year = parseInt($yearControl.value, 10)
  context.lineWidth = 1
  hexFeatures.forEach(feature => {
    context.beginPath()
    geoGenerator(feature)
    const state = Milieu(feature.properties.hex, year).state()
    if (state) {
      const hue = Math.floor(MurmurHash3(state.name()).result() % 360)
      context.strokeStyle = `hsl(${hue} ${saturation}% ${lightness}%)`
    } else {
      context.strokeStyle = 'white'
    }
    context.stroke()
  })
}

const yearFormat = year => year > 0 ? `${year} CE` : `${-year} BCE`
$yearControl.min = minYear
$yearControl.max = maxYear
$yearControl.value = year
$yearControl.addEventListener('input', update)

const $popup = document.getElementById('popup')

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const [lon, lat] = projection.invert([x, y])
  const hex = locateHex(lat, lon)
  const milieu = Milieu(hex, year)
  if (milieu.place()) {
    $popup.style.display = 'block'
    $popup.style.left = `${event.clientX}px`
    $popup.style.top = `${event.clientY}px`
    if (milieu.state()) {
      $popup.innerHTML = `<div>${milieu.place()}</div><div>${milieu.state().name()}</div>`
    } else {
      $popup.innerHTML = `<div>${milieu.place()}</div>`
    }
  }
})

update()
