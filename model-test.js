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
    const state = new State(stateName)
    try {
      state.stateInfo()
    } catch (error) {
      missingStates.add(stateName)
      continue
    }
  }
  assert.strictEqual(missingStates.size, 0, `Missing states: ${Array.from(missingStates).join(', ')}`)
})

test('hexes', () => {
  assert(hexes().length > 700)
})

test('Greenland history', () => {
  const hex = hexes().find(hex => hex.hasCellCode('8206d7fffffffff'))
  assert(hex)
  assert.deepEqual(hex.stateNames(), ['Norway', 'Denmark'])

  const danishPeriod = new Milieu(hex, 1800).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const norweigenPeriod = new Milieu(hex, 1400).state()
  assert.strictEqual(norweigenPeriod.name(), 'Norway')
})

test('Norway history', () => {
  const hex = hexes().find(hex => hex.hasCellCode('82099ffffffffff'))
  assert.deepEqual(hex.stateNames(), ['Denmark', 'Germany', 'Norway'])

  const earlyPeriod = new Milieu(hex, 1200).state()
  assert.strictEqual(earlyPeriod.name(), 'Norway')

  const danishPeriod = new Milieu(hex, 1700).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const early20C = new Milieu(hex, 1900).state()
  assert.strictEqual(early20C.name(), 'Norway')

  const naziOccupation = new Milieu(hex, 1942).state()
  assert.strictEqual(naziOccupation.name(), 'Germany')

  const now = new Milieu(hex, 2025).state()
  assert.strictEqual(now.name(), 'Norway')
})

test('Bay Area history', () => {
  const hex = hexes().find(hex => hex.hasCellCode('822837fffffffff'))
  assert.deepEqual(hex.stateNames(), ['USA', 'Mexico', 'Spain'])

  const now = new Milieu(hex, 2025).state()
  assert.strictEqual(now.name(), 'USA')

  const mexican = new Milieu(hex, 1830).state()
  assert.strictEqual(mexican.name(), 'Mexico')

  const spanish = new Milieu(hex, 1800).state()
  assert.strictEqual(spanish.name(), 'Spain')
})
