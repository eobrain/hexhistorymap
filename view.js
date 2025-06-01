// import MurmurHash3 from 'https://esm.sh/imurmurhash'
import stateData from './states.js'

export const stateColor = (state) => {
  return state ? stateData[state.name()].color : 'black'
  // const hue = state ? MurmurHash3('hhh' + state.name()).result() % 360 : 0
  // const saturation = state ? 25 + MurmurHash3('sss' + state.name()).result() % 75 : 0
  // const lightness = state ? 35 + MurmurHash3('lll' + state.name()).result() % 50 : 75
  // return `hsl(${hue} ${saturation}% ${lightness}%)`
}
