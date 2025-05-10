// import { pp } from 'passprint'

const apiKey = process.env.OPENCAGE_API_KEY

export const geocode = async (lat, lon) => {
  // const api = `https://geocode.xyz/${lat},${lon}?json=1`
  const api = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lon}&key=${apiKey}&language=en`
  const response = await fetch(api)
  const { results } = await response.json()
  if (!results || results.length === 0) {
    return 'Unknown'
  }
  return results[0].formatted.split(',').map(s => s.trim()).slice(-3).join(', ')
}
