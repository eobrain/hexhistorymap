import { select, pointer } from 'https://esm.sh/d3-selection'
import { geoPath, geoAzimuthalEqualArea, geoGraticule } from 'https://esm.sh/d3-geo'
import { json } from 'https://esm.sh/d3-fetch'
import { Milieu, stateCoordinates, locateHex, yearRange } from './model.js'
import MurmurHash3 from 'https://esm.sh/imurmurhash'

/* global $start, $yearControl, $yearDisplay, $google, $googleMap, $note, $hex, $place, $state, $hexName, $presentDay */

let milieu

const thisYear = 2025

const geojson = await json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

const $canvas = document.getElementById('map')
$canvas.width = $canvas.clientWidth
$canvas.height = $canvas.width

const d3Canvas = select('#map')
const canvas = d3Canvas.node()
const context = canvas.getContext('2d')

context.fillStyle = 'black'
context.font = '12px sans-serif'
context.textAlign = 'center'
context.textBaseline = 'middle'

const projection = geoAzimuthalEqualArea()
  .fitSize([canvas.width, canvas.height], geojson)

const geoGenerator = geoPath()
  .projection(projection)
  .pointRadius(6.7)
  .context(context)

const year = () => parseInt($yearControl.value, 10)

const yearFormat = year => year > 0 ? `${year} CE` : `${-year} BCE`

const updateLocation = (lat, lon) => {
  const hex = locateHex(lat, lon)
  const [hexLat, hexLon] = hex.latLon()
  projection.rotate([-hexLon, -hexLat])
  milieu = Milieu(hex, year())
  update()
}

const saturation = 50
const lightness = 50

const update = () => {
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)
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

  $yearDisplay.innerHTML = yearFormat(year())
  context.lineWidth = 1

  const coordinatesOfStates = stateCoordinates(year())
  for (const stateName in coordinatesOfStates) {
    const coordinates = coordinatesOfStates[stateName]
    context.beginPath()
    context.lineWidth = stateName === milieu.state()?.name() ? 2 : 0.5
    context.strokeStyle = `hsl(${Math.floor(MurmurHash3(stateName).result() % 360)} ${saturation}% ${lightness}%)`
    geoGenerator(
      {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }]
      })
    context.stroke()
  }

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
    if (year() !== thisYear) {
      const presentDayMilieu = milieu.inDifferentYear(thisYear)
      if (presentDayMilieu.state() && presentDayMilieu.state().name() !== milieu.state().name()) {
        presentDayMilieuName = `(present day ${presentDayMilieu.state().name()})`
      }
    }
    $presentDay.innerHTML = presentDayMilieuName
    $place.innerHTML = milieu.place()
    $hexName.innerHTML = milieu.hexName()
    const googleQuery = `${milieu.state().name()} in ${year()}`
    $google.innerHTML = googleQuery
    $google.href = `https://google.com/search?q=${googleQuery}`
    $googleMap.href = `https://maps.google.com/?ll=${hexLat},${hexLon}&z=8`
    $hex.href = `https://h3geo.org/#hex=${milieu.cellCode()}`
  } else {
    $note.style.display = 'none'
  }
}

const { minYear, maxYear } = yearRange()
$yearControl.min = minYear
$yearControl.max = maxYear
$yearControl.value = maxYear
$yearControl.addEventListener('input', update)

$start.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    $start.style.display = 'none'
    const { latitude, longitude } = position.coords

    updateLocation(latitude, longitude)

    let scale = projection.scale()

    d3Canvas.on('wheel', function (event) {
      scale *= 1.01 ** event.deltaY
      scale = Math.max(150, Math.min(scale, 500))
      projection.scale(scale)
      $canvas.width = $canvas.clientWidth
      $canvas.height = $canvas.width
      update(milieu)
      event.preventDefault()
    }, { passive: false })

    d3Canvas.on('click', function (event) {
      const pos = pointer(event, canvas)
      const [lon, lat] = projection.invert(pos)
      updateLocation(lat, lon)
    })

    update(milieu)
  })
})
