import hexes from './hexes.js'
import states from './states.js'
import { dump } from 'js-yaml'
import fs from 'fs'

const sortKeys = true

fs.writeFileSync('hexes.yaml', dump(hexes), { sortKeys })
fs.writeFileSync('states.yaml', dump(states), { sortKeys })
