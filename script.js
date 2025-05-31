import { select, pointer } from 'https://esm.sh/d3-selection'
import { geoPath, geoOrthographic, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'
import { Milieu, State, stateCoordinates, locateHex, yearRange, hexes } from './model.js'
import regioncode2state from './regioncode2state.js'
import { stateColor } from './view.js'
import { drawChart, updateChart } from './chart.js'

/* global Hammer, $yearDisplay, $google, $googleMap, $note, $hex, $place, $state, $hexName, $presentDay */

let milieu
let projectionLat = 0
let projectionLon = 0

const thisYear = 2025

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const regionCode = new Intl.Locale(navigator.language).region
const currentStateName = regioncode2state[regionCode] || 'Ireland'
const [localeLat, localeLon] = new State(currentStateName).centroidLatLon(thisYear)

const $canvas = document.getElementById('map')
$canvas.width = $canvas.clientWidth
$canvas.height = $canvas.width

const hammertime = new Hammer($canvas)
hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL })

const d3Canvas = select('#map')
const canvas = d3Canvas.node()
const context = canvas.getContext('2d')

context.fillStyle = 'black'
context.font = '12px sans-serif'
context.textAlign = 'center'
context.textBaseline = 'middle'

const projection = geoOrthographic()
  .fitSize([canvas.width, canvas.height], geojson)

const geoGenerator = geoPath()
  .projection(projection)
  .context(context)

// const controlYear = () => parseInt($yearControl.value, 10)

const { minYear, maxYear } = yearRange()

const yearFormat = year => year > 0 ? `${year} CE` : `${-year} BCE`

const updateLocation = (lat, lon) => {
  const hex = locateHex(lat, lon)
  const [hexLat, hexLon] = hex.latLon()
  projectionLat = hexLat
  projectionLon = hexLon
  projection.rotate([-projectionLon, -projectionLat])

  if (!milieu || hex.isValid()) {
    milieu = new Milieu(hex, maxYear)
  } else {
    $note.style.display = 'none'
  }
  update()
}

const updateYear = (newYear) => {
  milieu = milieu.inDifferentYear(newYear)
  update()
  updateChart(newYear)
}

const update = () => {
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Graticule
  const graticule = geoGraticule()
  context.beginPath()
  context.strokeStyle = '#ccc'
  geoGenerator(graticule())
  context.stroke()

  $yearDisplay.innerHTML = yearFormat(milieu.year())
  context.lineWidth = 1

  const coordinatesOfStates = stateCoordinates(milieu.year())
  hexes().map(hex => new Milieu(hex, milieu.year())).forEach(m => {
    context.beginPath()
    context.lineWidth = m.land() > 2 ? 1 : 0.5
    context.fillStyle = context.strokeStyle = stateColor(m.state())
    const coordinates = m.coordinates()
    geoGenerator({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } })
    // if (m.land() > 2) {
    context.fill()
    // }
    context.stroke()
  })

  if (milieu.state()) {
    const coordinates = coordinatesOfStates[milieu.state().name()]
    context.beginPath()
    // context.lineWidth = stateName === milieu.state()?.name() ? 2 : 0.5
    context.strokeStyle = 'black'
    geoGenerator({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } })
    context.stroke()
  }

  context.lineWidth = 0.5
  context.strokeStyle = 'white'
  context.beginPath()
  geoGenerator({ type: 'FeatureCollection', features: geojson.features })
  context.stroke()

  if (milieu.state()) {
    $note.style.display = 'block'
    context.fillStyle = 'black'
    const [hexLat, hexLon] = milieu.latLon()
    const [xx, yy] = projection([hexLon, hexLat])
    context.fillText(milieu.state().name(), xx, yy)
    $note.style.display = 'block'
    // $googleMap.href = `https://www.google.com/maps/place/${milieu.state().name()}`
    $state.innerHTML = milieu.state().name()
    let presentDayMilieuName = ''
    if (milieu.year() !== thisYear) {
      const presentDayMilieu = milieu.inDifferentYear(thisYear)
      if (presentDayMilieu.state() && presentDayMilieu.state().name() !== milieu.state().name()) {
        presentDayMilieuName = `(present day ${presentDayMilieu.state().name()})`
      }
    }
    $presentDay.innerHTML = presentDayMilieuName
    $place.innerHTML = milieu.place()
    $hexName.innerHTML = milieu.hexName()
    const googleQuery = `${milieu.state().name()} in ${milieu.year()}`
    $google.innerHTML = googleQuery
    $google.href = `https://google.com/search?q=${googleQuery}`
    $googleMap.href = `https://maps.google.com/?ll=${hexLat},${hexLon}&z=8`
    $hex.href = milieu.hexUrl()
  } else {
    $note.style.display = 'none'
  }
}

// $yearControl.min = minYear
// $yearControl.max = maxYear
// $yearControl.value = maxYear
// $yearControl.addEventListener('input', () => updateYear(controlYear()))

updateLocation(localeLat, localeLon)

// const scale = projection.scale()

hammertime.on('pan', function (event) {
  /*
    scale *= 1.01 ** event.deltaY
    scale = Math.max(150, Math.min(scale, 500))
    projection.scale(scale)
    $canvas.width = $canvas.clientWidth
    $canvas.height = $canvas.width
    update()
    console.log(`Scale: ${scale}`)
    */

  projectionLat += event.deltaY / 100.0
  projectionLon -= event.deltaX / 100.0
  projectionLat = Math.max(-90, Math.min(projectionLat, 90))
  updateLocation(projectionLat, projectionLon)
})

d3Canvas.on('click', function (event) {
  const pos = pointer(event, canvas)
  const [lon, lat] = projection.invert(pos)
  updateLocation(lat, lon)
})

drawChart(maxYear, function (x) {
  let updatedYear = x + minYear // milieu.year() + event.deltaX
  updatedYear = Math.max(minYear, Math.min(updatedYear, maxYear))
  if (updatedYear !== milieu.year()) {
    updateYear(updatedYear)
  }
  console.log(`Year: ${updatedYear}`)
})
update()
