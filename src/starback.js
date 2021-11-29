import Dot from "./types/dot"
import Line from "./types/dot"

/**
 * Default Config
 * @type {Object}
 */
export const StarbackDefaultConfig = {
  width: 800,
  height: 600,
  speed: 0.5,
  starColor: ['#fb00ff', '#00dde0'],
  maxStar: 200,
  starSize: 100,
  directionY: 1, // 1 = top-to-bottom, 2 = bottom-to-top
  directionX: 1, // 1 = left-to-right, 2 = right-to-left
  distanceX: 0.1, // distance of the current start X
  slope: { x: 1, y: 1 },
  frequency: 10,
  spread: 1,
  randomOpacity: false,
  backgroundColor: '#ccc',
  showFps: false,
  type: 'dot'
}

/**
 * Starback class wrapper
 * @class Starback
 */
export default class Starback {
  static DefaultConfig = StarbackDefaultConfig

  /**
   * Stores stars' class
   * @type {Dot|Line}
   */
  stars = null

  starTypes = {
    'dot': Dot,
    'line': Line
  }

  /**
   * Starback library
   * @param {HTMLElement|string} Canvas element or the selector
   * @param {Object} options
   */
  constructor(canvas, config = {}) {
    this.canvas = canvas instanceof HTMLElement ? canvas : document.querySelector(canvas)
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d')

    // merge config
    this.mergeConfig(config)

    //
    this.repeat = 0

    // storing callbacks
    this.frontCallbacks = []
    this.behindCallbacks = []

    // for calculating fps
    this.fps = 0
    this.lastCalledTime = 0

    // time tracking
    this.lastGenerated = 0

    this.init()
  }
  /**
   * Merge Config
   * @param  {StarbackDefaultConfig|object} instanceConfig
   */
  mergeConfig(instanceConfig) {
    // merge config
    const config = Object.assign(StarbackDefaultConfig, instanceConfig)

    // apply config
    this.width = config.width
    this.height = config.height
    this.speed = config.speed
    this.directionY = config.directionY * -1
    this.directionX = config.directionX
    this.starColor = config.starColor
    this.maxStar = config.maxStar
    this.slope = config.slope
    this.starSize = config.starSize
    this.showFps = config.showFps
    this.backgroundColor = config.backgroundColor
    this.distanceX = config.distanceX
    this.frequency = config.frequency
    this.randomOpacity = config.randomOpacity
    this.spread = config.spread
    this.type = config.type
  }

  /**
   * Initialize canvas before render
   */
  init() {
    this.canvas.setAttribute('width', this.width)
    this.canvas.setAttribute('height', this.height)

    this.stars = new this.starTypes[this.type](canvas, this.config)

    requestAnimationFrame((t) => this.render(t))
  }
  
  
  /**
   * Set background for the whole canvas
   */
  setBackground() {
    let bg

    if (typeof this.backgroundColor == 'string') bg = this.backgroundColor
    else if (typeof this.backgroundColor == 'object') {
      bg = this.ctx.createLinearGradient(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height)

      this.backgroundColor.forEach((bgString, index) => {
        bg.addColorStop(index / this.backgroundColor.length, bgString)
      })
    }

    this.ctx.fillStyle = bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw the frame into the canvas
   */
  draw() {
    this.stars.draw()
  }

  /**
   * Update everything in the canvas frame including stars
   */
  update() {
    this.stars.update()
  }

  /**
   * Add an object in front of the stars
   * @param {Function} cb Callback function
   */
  addToFront(cb) {
    this.frontCallbacks.push(cb)
  }

  /**
   * Add an object behind the stars
   * @param {Function} cb Callback function
   */
  addToBehind(cb) {
    this.behindCallbacks.push(cb)
  }

  /**
   * The total quantity of stars in canvas
   * @param {Number} amount The number of stars
   */
  generateStar(amount) {
    this.stars.generate(amount)
  }

  /**
   * Draw the FPS in the canvas.
   */
  drawFps() {
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(`${this.fps} fps`, 10, 10)
  }


  /**
   * Canvas render function
   * @param {DOMHighResTimeStamp} timestamp 
   */
  render(timestamp) {
    if (!this.lastCalledTime) this.lastCalledTime = timestamp

    let deltaTime = timestamp - this.lastCalledTime
    this.fps = Math.round(1000 / deltaTime)
    this.lastCalledTime = timestamp

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.setBackground()
    this.draw()
    this.update()

    requestAnimationFrame((t) => this.render(t))
  }

  
}
