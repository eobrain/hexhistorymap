import hexes from './hexes.js'
import states from './states.js'
import { dump } from 'js-yaml'
import fs from 'fs'

const noArrayIndent = true
const options = { noArrayIndent }

const hexesSorted = Object.fromEntries(
  Object.entries(hexes).sort((a, b) => a[0].localeCompare(b[0]))
)

fs.writeFileSync('hexes.yaml', dump(hexesSorted, options))
fs.writeFileSync('states.yaml', dump(states, options))
