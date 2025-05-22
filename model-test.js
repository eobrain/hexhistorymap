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
  assert.deepEqual(hex.stateNames(), ['Norway', 'Denmark'])

  const danishPeriod = Milieu(hex, 1800).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const norweigenPeriod = Milieu(hex, 1400).state()
  assert.strictEqual(norweigenPeriod.name(), 'Norway')
})

test('Norway history', () => {
  const hex = hexes().find(hex => hex.cellCode === '82099ffffffffff')
  assert.deepEqual(hex.stateNames(), ['Denmark', 'Germany', 'Norway'])

  const earlyPeriod = Milieu(hex, 1200).state()
  assert.strictEqual(earlyPeriod.name(), 'Norway')

  const danishPeriod = Milieu(hex, 1700).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const early20C = Milieu(hex, 1900).state()
  assert.strictEqual(early20C.name(), 'Norway')

  const naziOccupation = Milieu(hex, 1942).state()
  assert.strictEqual(naziOccupation.name(), 'Germany')

  const now = Milieu(hex, 2025).state()
  assert.strictEqual(now.name(), 'Norway')
})
