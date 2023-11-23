import { TetrisDisplayController } from './TetrisDisplayController'
import { Display } from '../core/display/Display'
import { Square } from '../core/Square'
import { SquareGroup } from '../core/SquareGroup'
import { TetrisShape } from './TetrisShape'
import { Shape, Coordinate } from '../core//interfaces'
import { TetrisRule } from './interfaces'
import config from './config'
import { TetrisRender } from './TetrisRender'
import { throttle } from 'lodash-es'

export class Tetris {
  private _controller?: TetrisDisplayController // 控制器
  private _display?: Display // 显示器
  private _render?: TetrisRender // 渲染器
  private _container?: HTMLElement | JQuery<HTMLElement> // 容器
  private _tetrisShape?: TetrisShape // 俄罗斯方块形状
  private _activeSquareGroups: SquareGroup[] = [] // 活动的方块组
  private _nextSquareGroup?: SquareGroup // 下一个方块组
  private _defaultSize: Coordinate = config.windowSize || { x: 10, y: 20 } // 默认窗口大小
  private _timeID?: number // 定时器ID
  private _keydownHandler?: (e: KeyboardEvent) => void // 键盘事件处理函数
  private _points: number = 0 // 分数
  private _pointRate: number = 1 // 分数倍率
  private _speed: number = config.speed || 1 // 下落速度
  private _isPause: boolean = false // 是否暂停
  private _isGameOver: boolean = false // 是否游戏结束
  private _rules: TetrisRule[] = [] // 限制规则
  private _defaultRules: TetrisRule[] = [
    function boundaryRule(
      this: Tetris,
      center: Coordinate,
      shape: Shape,
      squares: Square[]
    ): boolean {
      const size = this._size as Coordinate
      const coordinates = SquareGroup.computedCoordinates(center, shape)
      return coordinates.every(c => c.x >= 0 && c.x <= size.x - 1 && c.y <= size.y - 1)
    },
    function overlapRule(
      this: Tetris,
      center: Coordinate,
      shape: Shape,
      squares: Square[]
    ): boolean {
      const coordinates = SquareGroup.computedCoordinates(center, shape)
      return coordinates.every(coordinate =>
        squares.every(
          square => !(square.coordinate.x === coordinate.x && square.coordinate.y === coordinate.y)
        )
      )
    }
  ] // 默认限制规则

  /**
   * 获取随机数的辅助函数（不包含最大值）
   */
  private _getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min)
  }

  /**
   * 节流函数
   */
  private _throttle(func: (...args: any) => any, wait: number = 100) {
    return throttle(func, wait)
  }

  /**
   * 注册键盘事件
   */
  private _registEvent() {
    const keydownHandler = (e: KeyboardEvent) => {
      e.preventDefault()
      switch (e.key) {
        case 'ArrowUp':
          this._throttle(this.rotate.bind(this))()
          break
        case 'ArrowDown':
          this._throttle(this.move.bind(this))({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          this._throttle(this.move.bind(this))({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          this._throttle(this.move.bind(this))({ x: 1, y: 0 })
          break
        case ' ':
          this._throttle(this.dropToBottom.bind(this))()
          break
        case 'Enter':
          if (this._isPause) {
            this.gameStart()
          } else {
            this.gamePause()
          }
          break
        default:
          break
      }
    }
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler)
    }
    window.addEventListener('keydown', keydownHandler)
    this._keydownHandler = keydownHandler
  }

  /**
   * 获取所有未激活的小方块
   */
  private _getInactiveSquares(): Square[] {
    const controller = this._controller as TetrisDisplayController
    return controller.squares.filter(square => {
      const squares: Square[] = []
      this._activeSquareGroups.forEach(squareGroup => squares.push(...squareGroup.squares))
      return !squares.includes(square)
    })
  }

  /**
   * 获取所有非自身方块组的小方块
   */
  private _getExcludeSelfSquares(squareGroup: SquareGroup): Square[] {
    const controller = this._controller as TetrisDisplayController
    return controller.squares.filter(square => {
      return !squareGroup.squares.includes(square)
    })
  }

  /**
   * 获取初始中心点
   */
  private _getInitialCenter(shape: Shape): Coordinate {
    const shapes: Shape[] = [shape]
    const tetrisShape = this._tetrisShape as TetrisShape
    for (let i = 0; i < 3; i++) {
      shapes.push(tetrisShape.rotateClockwiseNinetyDegrees(shapes[i]))
    }
    // 以上代码暂时无用

    const size = this._size as Coordinate
    const controller = this._controller as TetrisDisplayController
    const topCoordinate = shape.find((coordinate, _, coordinates) =>
      coordinates.every(c => coordinate.y <= c.y)
    ) as Coordinate
    const bottomCoordinate = shape.find((coordinate, _, coordinates) =>
      coordinates.every(c => coordinate.y >= c.y)
    ) as Coordinate
    const leftCoordinate = shape.find((coordinate, _, coordinates) =>
      coordinates.every(c => coordinate.x <= c.x)
    ) as Coordinate
    const rightCoordinate = shape.find((coordinate, _, coordinates) =>
      coordinates.every(c => coordinate.x >= c.x)
    ) as Coordinate
    const allCenters: Coordinate[] = []
    for (let i = 0; i <= size.x - 1; i++) {
      const center: Coordinate = {
        x: i,
        y: -1 - bottomCoordinate.y
      }
      allCenters.push(center)
    }
    const relativeY = bottomCoordinate.y - topCoordinate.y + 1
    const _getCenters = (relativeY: number): Coordinate[] => {
      if (relativeY <= 0) {
        return []
      }
      const centers = allCenters.filter(center => {
        const squares = [...controller.squares]
        const validates: boolean[] = []
        for (let i = 0; i <= relativeY - 1; i++) {
          validates.push(
            this.validate({ x: center.x, y: center.y + relativeY - i }, shape, squares)
          )
        }
        return validates.every(validate => validate)
      })
      if (centers.length === 0) {
        return _getCenters(relativeY - 1)
      }
      return centers
    }
    const centers = _getCenters(relativeY)
    if (centers.length === 0) {
      this.gameOver()
      return { x: -5, y: -5 }
    }
    return centers[this._getRandom(0, centers.length)]
  }

  /**
   * 获取到达触底的相对坐标
   */
  private _getBottomTouchRelativeCoordinate(squareGroup: SquareGroup): Coordinate {
    const size = this._size as Coordinate
    const inactiveSquares = this._getInactiveSquares()
    const coordinates = SquareGroup.computedCoordinates(squareGroup.center, squareGroup.shape)
    const relativeYs: number[] = coordinates.map(coordinate => {
      const y: number = Math.min(
        ...inactiveSquares
          .filter(
            square => square.coordinate.x === coordinate.x && square.coordinate.y > coordinate.y
          )
          .map(square => square.coordinate.y),
        size.y
      )
      return y - coordinate.y - 1
    })
    const relativeCoordinate = { x: 0, y: Math.min(...relativeYs) }
    return relativeCoordinate
  }

  private _move(squareGroup: SquareGroup, coordinate: Coordinate) {
    const controller = this._controller as TetrisDisplayController
    if (controller.squareGroups.includes(squareGroup)) {
      controller.moveSquareGroup(squareGroup, coordinate)
    }
  }

  constructor(private _size?: Coordinate) {
    this.init()
  }
  get render(): TetrisRender | undefined {
    return this._render
  }
  get points(): number {
    return this._points
  }
  set points(value: number) {
    const dp = value - this._points
    this._points = value
    this.speed += dp / 500
    // 通知控制器
    const controller = this._controller as TetrisDisplayController
    controller.receive()
  }
  get speed(): number {
    return this._speed
  }
  set speed(value: number) {
    if (value < 0.5) {
      value = 0.5
    }
    if (value > 10) {
      value = 10
    }
    this._speed = value
    this.startAutoDrop()
    // 通知控制器
    const controller = this._controller as TetrisDisplayController
    controller.receive()
  }
  get isPause(): boolean {
    return this._isPause
  }
  set isPause(value: boolean) {
    this._isPause = value
    // 通知控制器
    const controller = this._controller as TetrisDisplayController
    controller.receive()
  }
  get isGameOver(): boolean {
    return this._isGameOver
  }
  set isGameOver(value: boolean) {
    this._isGameOver = value
    // 通知控制器
    const controller = this._controller as TetrisDisplayController
    controller.receive()
  }
  get nextSquareGroup(): SquareGroup {
    if (!this._nextSquareGroup) {
      return this.createNext()
    }
    return this._nextSquareGroup
  }

  /**
   * 初始化函数
   */
  public init(): void {
    this._display = new Display()
    this._controller = new TetrisDisplayController(this)
    this._render = new TetrisRender(this)
    if (this._container) {
      this._render.mount(this._container)
    }
    this._display.setController(this._controller)
    this._display.setRender(this._render)
    this._controller.connect(this._display)
    this._tetrisShape = TetrisShape.instance
    if (!this._size) {
      this._size = this._defaultSize
    }
    this._rules.push(...this._defaultRules)
    this.points = 0
    this._pointRate = 1
    this.speed = config.speed || 1
    this._activeSquareGroups = []
    this.isGameOver = false
    this.isPause = false
    this._registEvent()
    this.createNext()
    this.active(this.create())
    this.gameStart()
  }

  /**
   * 添加限制规则
   */
  public addRule(rule: TetrisRule) {
    this._rules.push(rule)
  }

  /**
   * 验证是否满足所有限制规则
   */
  public validate(center: Coordinate, shape: Shape, squares: Square[]): boolean {
    return this._rules.every(rule => rule.call(this, center, shape, squares))
  }

  /**
   * 创建下一个俄罗斯方块模版对象
   */
  public createNext(): SquareGroup {
    const tetrisShape = this._tetrisShape as TetrisShape
    const shape = tetrisShape.getRandomShape()
    const color = this.getRadomColor()
    const center = { x: 2, y: 2 }
    const nextSquareGroup = new SquareGroup(center, shape, color)
    this._nextSquareGroup = nextSquareGroup
    return nextSquareGroup
  }

  /**
   * 创建一个俄罗斯方块
   */
  public create(): SquareGroup {
    if (this.isGameOver || this.isPause) {
      return this.nextSquareGroup
    }
    const controller = this._controller as TetrisDisplayController
    const shape = this.nextSquareGroup.shape
    const color = this.nextSquareGroup.color
    const center = this._getInitialCenter(shape)
    const squareGroup = controller.createSquareGroup(center, shape, color)
    controller.receive()
    this.createNext()
    return squareGroup
  }

  /**
   * 激活一个俄罗斯方块
   */
  public active(squareGroup: SquareGroup): void {
    const controller = this._controller as TetrisDisplayController
    if (controller.squareGroups.includes(squareGroup)) {
      this._activeSquareGroups.push(squareGroup)
    }
  }

  /**
   * 取消激活一个俄罗斯方块
   */
  public deactive(squareGroup: SquareGroup): void {
    const index = this._activeSquareGroups.indexOf(squareGroup)
    if (index !== -1) {
      this._activeSquareGroups.splice(index, 1)
    }
  }

  /**
   * 根据相对坐标移动所有激活的俄罗斯方块
   */
  public move(relativeCoordinate: Coordinate): boolean {
    let shouldCreate: number = 0
    if (this.isGameOver || this.isPause) {
      return false
    }
    if (relativeCoordinate.y > 0) {
      // 向下移动才触发触底检测
      shouldCreate = this.bottomTouchDetect().length
    }
    if (
      !this._activeSquareGroups.every(squareGroup => {
        const coordinate = {
          x: squareGroup.center.x + relativeCoordinate.x,
          y: squareGroup.center.y + relativeCoordinate.y
        }
        const squares = this._getExcludeSelfSquares(squareGroup)
        return this.validate(coordinate, squareGroup.shape, squares)
      })
    ) {
      return false
    }
    const controller = this._controller as TetrisDisplayController
    this._activeSquareGroups.forEach(squareGroup => {
      const coordinate = {
        x: squareGroup.center.x + relativeCoordinate.x,
        y: squareGroup.center.y + relativeCoordinate.y
      }
      controller.moveSquareGroup(squareGroup, coordinate)
    })

    for (let i = 0; i < shouldCreate; i++) {
      this.active(this.create())
    }
    return true
  }

  /**
   * 将所有激活的俄罗斯方块直接触底
   */
  public dropToBottom() {
    this._activeSquareGroups.forEach(squareGroup => {
      const relativeCoordinate = this._getBottomTouchRelativeCoordinate(squareGroup)
      this.move(relativeCoordinate)
      this.move({ x: 0, y: 1 })
    })
  }

  /**
   * 改变所有激活的俄罗斯方块颜色
   */
  public changeColor(color: string): boolean {
    if (this.isGameOver || this.isPause) {
      return false
    }
    const controller = this._controller as TetrisDisplayController
    this._activeSquareGroups.forEach(squareGroup =>
      controller.changeSquareGroupColor(squareGroup, color)
    )
    return true
  }

  /**
   * 改变所有激活的俄罗斯方块形状，即旋转
   */
  public rotate(): boolean[] {
    if (this.isGameOver || this.isPause) {
      return []
    }
    const controller = this._controller as TetrisDisplayController
    const tetrisShape = this._tetrisShape as TetrisShape
    const result: boolean[] = []
    this._activeSquareGroups.forEach(squareGroup => {
      const shape = squareGroup.shape
      const shapes = tetrisShape.shapes.find(shapes => shapes.includes(shape)) as Shape[]
      const index = shapes.indexOf(shape)
      const newShape = shapes[(index + 1) % shapes.length]
      const squares = this._getExcludeSelfSquares(squareGroup)
      if (!this.validate(squareGroup.center, newShape, squares)) {
        return result.push(false)
      }
      controller.changeSquareGroupShape(squareGroup, newShape)
      return result.push(true)
    })
    return result
  }

  /**
   * 设置下落速度
   */
  public setSpeed(speed: number) {
    if (speed < 1) {
      return (this._speed = 0.5)
    }
    if (speed > 10) {
      return (this._speed = 10)
    }
    return (this._speed = speed)
  }

  /**
   * 开启自动下落
   */
  public startAutoDrop() {
    this.stopAutoDrop()
    this._timeID = window.setInterval(() => {
      this.move({ x: 0, y: 1 })
    }, 1000 / this._speed)
  }

  /**
   * 关闭自动下落
   */
  public stopAutoDrop() {
    window.clearInterval(this._timeID)
  }

  /**
   * 触底检测
   */
  public bottomTouchDetect(): SquareGroup[] {
    const bottomTouchSquareGroups: SquareGroup[] = []
    this._activeSquareGroups.forEach(squareGroup => {
      const relativeCoordinate = this._getBottomTouchRelativeCoordinate(squareGroup)
      if (relativeCoordinate.y === 0) {
        this.deactive(squareGroup)
        bottomTouchSquareGroups.push(squareGroup)
        this.clearLines()
      }
    })
    return bottomTouchSquareGroups
  }

  /**
   * 消除所有满行
   */
  public clearLines() {
    const size = this._size as Coordinate
    const controller = this._controller as TetrisDisplayController
    const inactiveSquares = this._getInactiveSquares()
    const lines: Square[][] = []
    const ls: number[] = []
    for (let l = 0; l < size.y; l++) {
      const lineSquares = inactiveSquares.filter(square => square.coordinate.y === l)
      if (lineSquares.length === size.x) {
        lines.push(lineSquares)
        ls.push(l)
      }
    }
    if (lines.length > 0) {
      lines.forEach(line => {
        line.forEach(square => {
          controller.deleteSquare(square)
          this.points += this._pointRate
        })
        this._pointRate *= 2
      })
      // this.dropAll()
      this.clearLines()
      this._pointRate = 1
    }
    const l = Math.max(...ls)
    const layers = ls.length
    this.moveDownAboveSquares(l, layers)
    if (inactiveSquares.some(s => s.coordinate.y < 0)) {
      this.gameOver()
      return
    }
  }

  /**
   * 触底某一行所有未激活方块
   */
  public dropLine(line: number) {
    const size = this._size as Coordinate
    const controller = this._controller as TetrisDisplayController
    const inactiveSquares = this._getInactiveSquares()
    const lineSquares = inactiveSquares.filter(square => square.coordinate.y === line)
    lineSquares.forEach(square => {
      const y = Math.min(
        ...inactiveSquares
          .filter(inactiveSquare => inactiveSquare.coordinate.x === square.coordinate.x)
          .map(s => s.coordinate.y)
          .filter(y => y > line),
        size.y
      )

      controller.moveSquare(square, { x: square.coordinate.x, y: y - 1 })
    })
  }

  /**
   * 触底所有未激活方块
   */
  public dropAll() {
    const size = this._size as Coordinate
    for (let l = size.y - 1; l >= 0; l--) {
      this.dropLine(l)
    }
  }

  /**
   * 下移某一行以上的所有未激活方块指定层数
   */
  public moveDownAboveSquares(line: number, layers: number) {
    const controller = this._controller as TetrisDisplayController
    const inactiveSquares = this._getInactiveSquares()
    const aboveSquares = inactiveSquares.filter(square => square.coordinate.y < line)
    aboveSquares.forEach(s => {
      controller.moveSquare(s, { x: s.coordinate.x, y: s.coordinate.y + layers })
    })
  }

  /**
   * 获取随机颜色
   */
  public getRadomColor(): string {
    return `rgba(${this._getRandom(20, 256)}, ${this._getRandom(20, 256)}, ${this._getRandom(
      20,
      256
    )}, ${Math.random() * 0.3 + 0.7}`
  }

  /**
   * 游戏开始
   */
  public gameStart() {
    this.isPause = false
    this.startAutoDrop()
  }

  /**
   * 游戏暂停
   */
  public gamePause() {
    this.isPause = true
    this.stopAutoDrop()
  }

  /**
   * 游戏结束
   */
  public gameOver() {
    this.isGameOver = true
    this.stopAutoDrop()
  }

  /**
   * 游戏重启，即重新开始一局
   */
  public gameRestart() {
    this.init()
  }

  /**
   * 挂载至指定容器
   */
  public mount(container: HTMLElement | JQuery<HTMLElement>) {
    const controller = this._controller as TetrisDisplayController
    const render = this._render as TetrisRender
    this._container = container
    render.mount(container)
    controller.receive()
  }
}
