import stateData from './site/states.js'
import maxichrome from 'maxichrome'

const stateNames = Object.keys(stateData)

const colors = await maxichrome(stateNames.length, [
  '#000000', '#010000', '#000100', '#000001',
  '#ffffff', '#feffff', '#fffeff', '#fffffe'])

for (let i = 0; i < stateNames.length; ++i) {
  const stateName = stateNames[i]
  stateData[stateName].color = colors[i]
}

console.log('export default', JSON.stringify(stateData, null, 2))
