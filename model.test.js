import test from 'ava'
import { hexes, Milieu, State } from './webcode/model.js'
import regioncode2state from './webcode/regioncode2state.js'
import * as h3 from 'h3-js'

global.h3 = h3

test('All states in hexes exist', t => {
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
  t.is(missingStates.size, 0, `Missing states: ${Array.from(missingStates).join(', ')}`)
})

test('Hex state ranges are within extant years of states', t => {
  for (const hex of hexes()) {
    for (const { stateName, begin, end } of hex.statesRanges()) {
      const state = new State(stateName)
      t.true(state.extantIn(begin), `${stateName} should exist in ${begin}`)
      t.true(state.extantIn(end), `${stateName} should exist in ${end}`)
    }
  }
})

test('hexes', t => {
  t.true(hexes().length > 700)
})

test('Greenland history', t => {
  const hex = hexes().find(hex => hex.hasCellCode('8206d7fffffffff'))
  t.truthy(hex)
  t.deepEqual(hex.stateNames(), ['Thule', 'Inuit', 'Denmark'])

  const today = new Milieu(hex, 2025).state()
  t.is(today.name(), 'Denmark')

  const danishPeriod = new Milieu(hex, 1800).state()
  t.is(danishPeriod.name(), 'Denmark')

  const thulePeriod = new Milieu(hex, 1550).state()
  t.is(thulePeriod.name(), 'Thule')

  const inuitPeriod = new Milieu(hex, 1650).state()
  t.is(inuitPeriod.name(), 'Inuit')
})

test('Norway history', t => {
  const hex = hexes().find(hex => hex.hasCellCode('82099ffffffffff'))
  t.deepEqual(hex.stateNames(), ['Denmark', 'Germany', 'Norway'])

  const earlyPeriod = new Milieu(hex, 1200).state()
  t.is(earlyPeriod.name(), 'Norway')

  const danishPeriod = new Milieu(hex, 1700).state()
  t.is(danishPeriod.name(), 'Denmark')

  const early20C = new Milieu(hex, 1900).state()
  t.is(early20C.name(), 'Norway')

  const naziOccupation = new Milieu(hex, 1942).state()
  t.is(naziOccupation.name(), 'Germany')

  const now = new Milieu(hex, 2025).state()
  t.is(now.name(), 'Norway')
})

test('Bay Area history', t => {
  const hex = hexes().find(hex => hex.hasCellCode('822837fffffffff'))
  t.deepEqual(hex.stateNames(), ['USA', 'Mexico', 'Spain'])

  const now = new Milieu(hex, 2025).state()
  t.is(now.name(), 'USA')

  const mexican = new Milieu(hex, 1830).state()
  t.is(mexican.name(), 'Mexico')

  const spanish = new Milieu(hex, 1800).state()
  t.is(spanish.name(), 'Spain')
})

test('Labrador', t => {
  const hex = hexes().find(hex => hex.hasCellCode('821bb7fffffffff'))

  t.is(new Milieu(hex, 2025).state().name(), 'Canada')
  t.is(new Milieu(hex, 1810).state().name(), 'Britain')
  t.is(new Milieu(hex, 1750).state().name(), 'France')
  t.is(new Milieu(hex, 1720).state().name(), 'France')
  t.is(new Milieu(hex, 1400).state().name(), 'Innu')
})

test('Newfoundland', t => {
  const hex = hexes().find(hex => hex.hasCellCode('821b9ffffffffff'))

  t.is(new Milieu(hex, 2025).state().name(), 'Canada')
  t.is(new Milieu(hex, 1810).state().name(), 'Britain')
  t.is(new Milieu(hex, 1750).state().name(), 'Britain')
  t.is(new Milieu(hex, 1720).state().name(), 'France')
})

test('region codes', t => {
  for (const regionCode of Object.keys(regioncode2state)) {
    const stateName = regioncode2state[regionCode]
    t.truthy(stateName, `Looking for state for ${regionCode}`)

    const state = new State(stateName)
    t.truthy(state, `Looking for state for ${stateName}`)

    const [localeLat, localeLon] = state.centroidLatLon(2025)
    t.true(localeLat !== 0 && localeLon !== 0, `Looking for centroid of ${stateName}`)
  }
})
