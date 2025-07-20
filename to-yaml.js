import hexes from './hexes.js'
import states from './states.js'
import { dump } from 'js-yaml'
import fs from 'fs'

const noArrayIndent = true
const options = { noArrayIndent }

const hexesSorted = Object.fromEntries(
  Object.entries(hexes).sort((a, b) => a[0].localeCompare(b[0]))
)

const middle = ({ begin, end }) => (end - begin) / 2 + begin

const statesSorted = Object.fromEntries(
  Object.entries(states).sort((a, b) => middle(a[1]) - middle(b[1]))
)

fs.writeFileSync('data/hexes.yaml', dump(hexesSorted, options))
fs.writeFileSync('data/states.yaml', dump(statesSorted, options))
