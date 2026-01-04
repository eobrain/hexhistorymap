import stateData from './states.js'

export const stateColor = (state) => state ? stateData[state.name()].color : 'black'
