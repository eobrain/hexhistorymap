import stateData from './states.js'
import maxichrome from 'maxichrome'
// import MurmurHash3 from 'imurmurhash'

const stateNames = Object.keys(stateData)

const colors = await maxichrome(stateNames.length, ['black', 'white'])

for (let i = 0; i < stateNames.length; ++i) {
  const stateName = stateNames[i]
  /* const colorIndex = MurmurHash3(stateName).result() % colors.length
  stateData[stateName].color = colors[colorIndex] */
  stateData[stateName].color = colors[i]
}

console.log('export default', JSON.stringify(stateData, null, 2))
