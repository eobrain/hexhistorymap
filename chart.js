import { Milieu, yearRange, hexes } from './model.js'
import { stateColor } from './view.js'

/* global $chart, $annotation, Hammer */

const { minYear, maxYear } = yearRange()

const STRETCH = 5 // stretch factor for the chart
const HEX_COUNT = hexes().length
const HEIGHT_PX = STRETCH * HEX_COUNT
const WIDTH = maxYear - minYear + 1
$chart.width = $annotation.width = WIDTH
$chart.height = $annotation.height = HEIGHT_PX
const chartCtx = $chart.getContext('2d')
const annotationCtx = $annotation.getContext('2d')

let prevX
let prevJ = 0

const drawYear = (year, hex) => {
  // chartCtx.fillStyle = 'white'
  annotationCtx.clearRect(0, 0, WIDTH, HEIGHT_PX)
  const x = year - minYear
  annotationCtx.beginPath()
  annotationCtx.strokeStyle = 'white'
  annotationCtx.moveTo(x, 0)
  annotationCtx.lineTo(x, HEIGHT_PX - 1)
  annotationCtx.stroke()
  prevX = x

  if (hex) {
    const y = hex.index() * STRETCH
    annotationCtx.beginPath()
    annotationCtx.strokeStyle = 'white'
    annotationCtx.moveTo(0, y)
    annotationCtx.lineTo(WIDTH - 1, y)
    annotationCtx.stroke()
    prevJ = hex.index()

    window.scrollTo({
      left: 0,
      top: y * $annotation.clientHeight / $annotation.height - window.innerHeight / 2,
      behavior: 'smooth'
    })
  }
}

export const updateChart = (year, hex) => {
  drawYear(year, hex)
}

export const drawChart = (year, panCallback) => {
  const hammertime = new Hammer($chart)
  hammertime.get('pan').set({ threshold: 1 })

  chartCtx.fillStyle = 'white'
  chartCtx.fillRect(0, 0, WIDTH, HEIGHT_PX)

  const drawLine = (x1, x2, y, color) => {
    chartCtx.beginPath()
    chartCtx.strokeStyle = color
    chartCtx.moveTo(x1, y)
    chartCtx.lineTo(x2, y)
    chartCtx.stroke()
  }

  for (let j = 0; j < HEX_COUNT; ++j) {
    const y = j * STRETCH
    const hex = hexes()[j]
    let prevColor
    let prevStartX
    chartCtx.lineWidth = STRETCH + 1
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
    const j = Math.trunc(y / STRETCH)
    panCallback(x, hexes()[j])
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      if (prevX > 0) {
        --prevX
      }
    } else if (event.key === 'ArrowRight') {
      if (prevX < WIDTH - 1) {
        ++prevX
      }
    } else if (event.key === 'ArrowUp') {
      if (prevJ > 0) {
        --prevJ
      }
    } else if (event.key === 'ArrowDown') {
      if (prevJ < HEX_COUNT - 1) {
        ++prevJ
      }
    } else {
      return
    }
    panCallback(prevX, hexes()[prevJ])
    event.preventDefault()
  })
}
