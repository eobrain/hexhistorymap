import stateData from './states.js'
import maxichrome from 'maxichrome'

const stateNames = Object.keys(stateData)

const colors = await maxichrome(stateNames.length, ['black', 'black', 'white', 'white'])

for (let i = 0; i < stateNames.length; ++i) {
  const stateName = stateNames[i]
  stateData[stateName].color = colors[i]
}

console.log('export default', JSON.stringify(stateData, null, 2))
