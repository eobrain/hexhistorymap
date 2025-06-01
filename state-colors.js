import stateData from './states.js'
import maxichrome from 'maxichrome'
import MurmurHash3 from 'imurmurhash'

const colors = await maxichrome(100, ['black', 'white'])

const stateNames = Object.keys(stateData)

for (let i = 0; i < stateNames.length; ++i) {
  const stateName = stateNames[i]
  const colorIndex = MurmurHash3(stateName).result() % colors.length
  stateData[stateName].color = colors[colorIndex]
}

console.log('export default', JSON.stringify(stateData, null, 2))
