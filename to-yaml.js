import hexes from './hexes.js'
import states from './states.js'
import { dump } from 'js-yaml'
import fs from 'fs'

fs.writeFileSync('hexes.yaml', dump(hexes))
fs.writeFileSync('states.yaml', dump(states))
