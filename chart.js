import { Milieu, yearRange, hexes } from './model.js'
import { stateColor } from './view.js'

/* global $chart, $annotation, Hammer */

const { minYear, maxYear } = yearRange()

const HEIGHT = hexes().length
const WIDTH = maxYear - minYear + 1
$chart.width = $annotation.width = WIDTH
$chart.height = $annotation.height = HEIGHT
const chartCtx = $chart.getContext('2d')
const annotationCtx = $annotation.getContext('2d')

const drawYear = year => {
  // chartCtx.fillStyle = 'white'
  annotationCtx.clearRect(0, 0, WIDTH, HEIGHT)
  const x = year - minYear
  annotationCtx.beginPath()
  annotationCtx.strokeStyle = 'black'
  annotationCtx.moveTo(x, 0)
  annotationCtx.lineTo(x, HEIGHT - 1)
  annotationCtx.stroke()
}

export const updateChart = year => {
  drawYear(year)
}

export const drawChart = (year, panCallback) => {
  const hammertime = new Hammer($chart)
  hammertime.get('pan').set({ threshold: 1 })

  chartCtx.fillStyle = 'white'
  chartCtx.fillRect(0, 0, WIDTH, HEIGHT)

  const drawLine = (x1, x2, y, color) => {
    chartCtx.beginPath()
    chartCtx.strokeStyle = color
    chartCtx.moveTo(x1, y)
    chartCtx.lineTo(x2, y)
    chartCtx.stroke()
  }

  for (let y = 0; y < HEIGHT; ++y) {
    const hex = hexes()[y]
    let prevColor
    let prevStartX
    for (let x = WIDTH - 1; x >= 0; --x) {
      const year = minYear + x
      const milieu = new Milieu(hex, year)
      const color = stateColor(milieu.state())
      if (color !== prevColor) {
        if (prevColor) {
          drawLine(prevStartX, x - 1, y, prevColor)
        }
        prevStartX = x
        prevColor = color
      }
    }
    if (prevColor) {
      drawLine(prevStartX, 0, y, prevColor)
    }
  }

  drawYear(year)

  // hammertime.on('pan', panCallback)
  $annotation.onclick = e => {
    const x = Math.trunc(e.offsetX * e.currentTarget.width / e.currentTarget.clientWidth)
    const y = Math.trunc(e.offsetY * e.currentTarget.height / e.currentTarget.clientHeight)
    panCallback(x, hexes()[y])
  }
}
