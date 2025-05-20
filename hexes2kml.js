import hexList from './hex-list.js'
import * as h3 from 'h3-js'
import toKml from '@maphubs/tokml'
import fs from 'fs'

const coordinates = h3.cellsToMultiPolygon(
  Object.keys(hexList).slice(0, 100),
  /* formatAsGeoJson= */true)

const geoJson = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates } }

//console.log(JSON.stringify(geoJson, null, 2))

const kml = toKml(geoJson)

fs.writeFileSync('hexes.kml', kml, 'utf8')
