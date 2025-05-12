import { load } from 'js-yaml'
import fs from 'fs'

const convert = base => {
  const data = load(fs.readFileSync(`${base}.yaml`, 'utf8'))
  const json = JSON.stringify(data)
  fs.writeFileSync(`${base}.js`, `export default ${json};`)
}

convert('hexes')
convert('states')
