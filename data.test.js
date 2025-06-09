import test from 'ava'
import hexData from './hexes.js'
import stateData from './states.js'

const stateNamesInHexes = () => {
  const stateNames = new Set()
  for (const base of Object.keys(hexData)) {
    for (const index1 of Object.keys(hexData[base])) {
      const parent = hexData[base][index1]
      for (const cellCode of Object.keys(parent.hexes)) {
        const hex = parent.hexes[cellCode]
        for (const stateName of Object.keys(hex.states || {})) {
          stateNames.add(stateName)
        }
        for (const stateName of Object.keys(parent.states || {})) {
          stateNames.add(stateName)
        }
      }
    }
  }
  return stateNames
}

test('All states in stateData are used in hexData', t => {
  const unusedStates = new Set(Object.keys(stateData)).difference(stateNamesInHexes())
  t.is(unusedStates.size, 0, `Should be no unused states: ${Array.from(unusedStates).join(', ')}`)
})
