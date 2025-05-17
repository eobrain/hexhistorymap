import { select } from 'https://esm.sh/d3-selection'
import { geoPath, geoAzimuthalEqualArea, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'
import { Milieu, stateCoordinates, locateHex, yearRange } from './model.js'
import MurmurHash3 from 'https://esm.sh/imurmurhash'

/* global $yearControl, $yearDisplay */

const { minYear, maxYear } = yearRange()
let year = maxYear

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const canvas = select('#content canvas').node()
const context = canvas.getContext('2d')

context.fillStyle = 'black'
context.font = '12px sans-serif'
context.textAlign = 'center'
context.textBaseline = 'middle'

const projection = geoAzimuthalEqualArea().fitSize([canvas.width, canvas.height], geojson)

const geoGenerator = geoPath()
  .projection(projection)
  .pointRadius(6.7)
  .context(context)

const saturation = 50
const lightness = 50

let selectedState

const update = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
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

  $yearDisplay.innerHTML = yearFormat($yearControl.value)
  year = parseInt($yearControl.value, 10)
  context.lineWidth = 1

  const coordinatesOfStates = stateCoordinates(year)
  for (const stateName in coordinatesOfStates) {
    const coordinates = coordinatesOfStates[stateName]
    context.beginPath()
    context.lineWidth = stateName === selectedState?.name() ? 2 : 0.5
    context.strokeStyle = `hsl(${Math.floor(MurmurHash3(stateName).result() % 360)} ${saturation}% ${lightness}%)`
    geoGenerator(
      {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }]
      })
    context.stroke()
  }
}

const yearFormat = year => year > 0 ? `${year} CE` : `${-year} BCE`
$yearControl.min = minYear
$yearControl.max = maxYear
$yearControl.value = year
$yearControl.addEventListener('input', update)

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const [lon, lat] = projection.invert([x, y])
  const hex = locateHex(lat, lon)
  projection.rotate([-lon, -lat])
  const milieu = Milieu(hex, year)
  if (milieu.place()) {
    if (milieu.state()) {
      selectedState = milieu.state()
    } else {
      selectedState = undefined
    }
    const [xx, yy] = projection([lon, lat])
    update()
    if (selectedState) {
      context.fillStyle = 'black'
      context.fillText(selectedState.name(), xx, yy)
    }
  }
})

update()
