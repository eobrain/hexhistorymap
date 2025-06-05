import { test } from 'node:test'
import assert from 'node:assert'
import { hexes, Milieu, State } from './model.js'
import regioncode2state from './regioncode2state.js'
import * as h3 from 'h3-js'

global.h3 = h3

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
  assert.deepEqual(hex.stateNames(), ['Thule', 'Inuit', 'Denmark'])

  const today = new Milieu(hex, 2025).state()
  assert.strictEqual(today.name(), 'Denmark')

  const danishPeriod = new Milieu(hex, 1800).state()
  assert.strictEqual(danishPeriod.name(), 'Denmark')

  const thulePeriod = new Milieu(hex, 1550).state()
  assert.strictEqual(thulePeriod.name(), 'Thule')

  const inuitPeriod = new Milieu(hex, 1650).state()
  assert.strictEqual(inuitPeriod.name(), 'Inuit')
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

test('Labrador', () => {
  const hex = hexes().find(hex => hex.hasCellCode('821bb7fffffffff'))

  assert.strictEqual(new Milieu(hex, 2025).state().name(), 'Canada')
  assert.strictEqual(new Milieu(hex, 1810).state().name(), 'Britain')
  assert.strictEqual(new Milieu(hex, 1750).state().name(), 'France')
  assert.strictEqual(new Milieu(hex, 1720).state().name(), 'France')
  assert.strictEqual(new Milieu(hex, 1400).state().name(), 'Innu')
})

test('Newfoundland', () => {
  const hex = hexes().find(hex => hex.hasCellCode('821b9ffffffffff'))

  assert.strictEqual(new Milieu(hex, 2025).state().name(), 'Canada')
  assert.strictEqual(new Milieu(hex, 1810).state().name(), 'Britain')
  assert.strictEqual(new Milieu(hex, 1750).state().name(), 'Britain')
  assert.strictEqual(new Milieu(hex, 1720).state().name(), 'France')
})

test('region codes', () => {
  for (const regionCode of Object.keys(regioncode2state)) {
    const stateName = regioncode2state[regionCode]
    assert(stateName, `Looking for state for ${regionCode}`)

    const state = new State(stateName)
    assert(state, `Looking for state for ${stateName}`)

    const [localeLat, localeLon] = state.centroidLatLon(2025)
    assert(localeLat !== 0 && localeLon !== 0, `Looking for centroid of ${stateName}`)
  }
})
