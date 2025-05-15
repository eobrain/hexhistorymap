import hexes from './hexes.js'
import states from './states.js'
import { dump } from 'js-yaml'
import fs from 'fs'

const sortKeys = true
const noArrayIndent = true
const options = { sortKeys, noArrayIndent }

fs.writeFileSync('hexes.yaml', dump(hexes, options))
fs.writeFileSync('states.yaml', dump(states, options))
