import { test } from 'node:test'
import assert from 'node:assert'
import { hexes, Milieu, State } from './model.js'

test('All states in hexes exist', () => {
  const allStateNames = new Set()
  for (const hex of hexes()) {
    const stateNames = hex.stateNames()
    for (const stateName of stateNames) {
      allStateNames.add(stateName)
    }
  }
  const missingStates = new Set()
  for (const stateName of allStateNames) {
    const state = State(stateName)
    try {
      state.stateInfo()
    } catch (error) {
      missingStates.add(stateName)
      continue
    }
  }
  assert.strictEqual(missingStates.size, 0, `Missing states: ${Array.from(missingStates).join(', ')}`)
})

test('Greenland history', () => {
  const hex = hexes().find(hex => hex.cellCode === '8206d7fffffffff')
  assert.deepEqual(hex.stateNames(), ['Denmark', 'Norway'])

  const danishPeriod = Milieu(hex, 1800).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const norweigenPeriod = Milieu(hex, 1400).state()
  assert.strictEqual(norweigenPeriod.name(), 'Norway')
})
