const canvas = document.getElementById('drawing-board')
const ctx = canvas.getContext('2d')
const range = document.getElementById('range')
const colorButtons = document.querySelectorAll('.color-item')
const eraser = document.getElementById('eraser')
const resetCanvas = document.getElementById('clear')
const undo = document.getElementById('undo')
const save = document.getElementById('save')
const brush = document.getElementById('brush')
let activeColor = 'black'
let lWidth = 4
let clear = false
let history = []

autoSetSize(canvas)

setBg('white')

listenToUser(canvas)

getColor()

window.onbeforeunload = function (e) {
  return ''
}

function autoSetSize(canvas) {
  canvasSetSize()

  window.onresize = function () {
    canvasSetSize()
  }

  function canvasSetSize() {
    const pageWidth = document.documentElement.clientWidth
    const pageHeight = document.documentElement.clientHeight

    canvas.width = pageWidth
    canvas.height = pageHeight
  }
}

function setBg(color) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function listenToUser(canvas) {
  let painting = false
  let lastPoint = { x: undefined, y: undefined }

  canvas.onmousedown = function (e) {
    // 在这里储存绘图，用于撤销
    saveData(ctx.getImageData(0, 0, canvas.width, canvas.height))

    painting = true
    let x = e.clientX
    let y = e.clientY
    lastPoint = { x, y }
    drawCircle(x, y, 0)
  }

  canvas.onmousemove = function (e) {
    if (painting) {
      let x = e.clientX
      let y = e.clientY
      let newPoint = { x, y }
      drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
      lastPoint = newPoint
    }
  }

  document.onmouseup = function () {
    painting = false
  }
}

function drawCircle(x, y, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  if (clear) {
    ctx.clip()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.lineWidth = lWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (clear) {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
    ctx.clip()
    ctx.clearRect(0, 0, canvas.width, canvas.height) // 由于指定了剪辑区域，所以只会清空剪辑区域的画布
    ctx.restore()
  } else {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
  }
}

function getColor() {
  colorButtons.forEach(button => {
    button.onclick = function () {
      colorButtons.forEach(item => item.classList.remove('active'))
      this.classList.add('active')
      activeColor = this.style.backgroundColor
      ctx.strokeStyle = activeColor
    }
  })
}

range.onchange = function () {
  lWidth = this.value
}

brush.onclick = function () {
  clear = false
  this.classList.add('active')
  eraser.classList.remove('active')
  canvas.classList.remove('eraser')
  canvas.classList.add('brush')
}

eraser.onclick = function () {
  clear = true
  this.classList.add('active')
  brush.classList.remove('active')
  canvas.classList.remove('brush')
  canvas.classList.add('eraser')
}

resetCanvas.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

save.onclick = function () {
  let imgUrl = canvas.toDataURL('image/png')
  let saveA = document.createElement('a')
  document.body.appendChild(saveA)
  saveA.href = imgUrl
  saveA.download = new Date().toLocaleString()
  saveA.click()
}

function saveData(data) {
  // 上限为储存10步，防止页面挂掉
  history.length === 10 && history.shift()
  history.push(data)
}

undo.onclick = function () {
  if (history.length < 1) return
  ctx.putImageData(history[history.length - 1], 0, 0)
  history.pop()
}
