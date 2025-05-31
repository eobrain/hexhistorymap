import MurmurHash3 from 'https://esm.sh/imurmurhash'

export const stateColor = (state) => {
  const hue = state ? MurmurHash3('h' + state.name()).result() % 360 : 0
  const saturation = state ? 25 + MurmurHash3('s' + state.name()).result() % 75 : 0
  const lightness = state ? 50 : 75
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}
