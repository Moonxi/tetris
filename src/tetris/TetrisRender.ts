import { DisplayRender } from '../core/display/DisplayRender'
import { TetrisDisplayController } from './TetrisDisplayController'
import config from './config'
import { Tetris } from './Tetris'
import $ from 'jquery'
import { Square } from '../core/Square'
import { SquareGroup } from '../core/SquareGroup'

export class TetrisRender extends DisplayRender {
  private _container?: HTMLElement | JQuery<HTMLElement> // 渲染容器
  private _requestIdleCallbackIds: number[] = [] // requestIdleCallback的id
  constructor(private _tetris: Tetris) {
    super()
  }

  /**
   * 挂载至渲染容器
   */
  public mount(container: HTMLElement | JQuery<HTMLElement>) {
    this._container = container
  }

  /**
   * 渲染函数
   */
  public render(controller: TetrisDisplayController) {
    // 颜色调暗
    function __darken(color: string, percent: number): string {
      const rgba = color
        .split('(')[1]
        .split(')')[0]
        .split(',')
        .map(c => +c)
      const r = rgba[0] - rgba[0] * percent < 0 ? 0 : rgba[0] - rgba[0] * percent
      const g = rgba[1] - rgba[1] * percent < 0 ? 0 : rgba[1] - rgba[1] * percent
      const b = rgba[2] - rgba[2] * percent < 0 ? 0 : rgba[2] - rgba[2] * percent
      const a = rgba[3]
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    // 颜色调亮
    function __lighten(color: string, percent: number): string {
      const rgba = color
        .split('(')[1]
        .split(')')[0]
        .split(',')
        .map(c => +c)
      const r =
        rgba[0] + (255 - rgba[0]) * percent > 255 ? 255 : rgba[0] + (255 - rgba[0]) * percent
      const g =
        rgba[1] + (255 - rgba[1]) * percent > 255 ? 255 : rgba[1] + (255 - rgba[1]) * percent
      const b =
        rgba[2] + (255 - rgba[2]) * percent > 255 ? 255 : rgba[2] + (255 - rgba[2]) * percent
      const a = rgba[3]
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    // 创建根节点
    function _createRoot() {
      return $('<div>').css({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // gap: '10px',
        height: config.windowSize.y * config.squareSize.height,
        marginTop: '30px'
      })
    }

    // 创建一个小方块UI
    function __createSquareUI(square: Square): JQuery<HTMLElement> {
      const color = square.color
      const darkenColor = __darken(color, 0.5)
      const lightenColor = __lighten(color, 0.5)
      return $('<div>').css({
        position: 'absolute',
        width: config.squareSize.width,
        height: config.squareSize.height,
        border: `${config.squareSize.width * 0.25}px solid #fff`,
        borderLeftColor: darkenColor,
        borderBottomColor: darkenColor,
        borderRightColor: lightenColor,
        borderTopColor: lightenColor,
        boxSizing: 'border-box',
        backgroundColor: color,
        left: square.coordinate.x * config.squareSize.width,
        top: square.coordinate.y * config.squareSize.height
      })
    }

    // 创建下一个方块组模板对象的UI
    function __createNextSquareGroupUI(squareGroup: SquareGroup): JQuery<HTMLElement>[] {
      const squareUIs: JQuery<HTMLElement>[] = []
      squareGroup.squares.forEach(square => {
        const squareUI = __createSquareUI(square)
        squareUIs.push(squareUI)
      })
      return squareUIs
    }

    // 创建游戏区域
    function _createTetrisBoard() {
      return $('<div>').css({
        position: 'relative',
        width: config.squareSize.width * config.windowSize.x,
        height: config.squareSize.height * config.windowSize.y,
        background: '#000',
        boxSizing: 'border-box',
        outline: '5px solid #fff'
        // boxShadow: '0 0 10px 10px #000'
      })
    }

    // 添加小方块UI至游戏区域
    function _addSquareUIToTetrisBoard(tetrisBoard: JQuery<HTMLElement>) {
      const squares = controller.squares.filter(square => {
        return (
          square.coordinate.y >= 0 &&
          square.coordinate.y <= config.windowSize.y - 1 &&
          square.coordinate.x >= 0 &&
          square.coordinate.x <= config.windowSize.x - 1
        )
      })
      squares.forEach(square => {
        const squareUI = __createSquareUI(square)
        tetrisBoard.append(squareUI)
      })
    }

    // 创建信息提示框
    function _createMessageBoard(message: string, color: string = '#fff') {
      return $('<div>')
        .css({
          position: 'absolute',
          width: '100%',
          height: config.squareSize.height * config.windowSize.y * 0.3,
          textAlign: 'center',
          boxSizing: 'border-box',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: '25px',
          fontWeight: 'bold',
          color: color,
          lineHeight: `${config.squareSize.height * config.windowSize.y * 0.3}px`
        })
        .text(message)
    }

    // 添加信息提示框至游戏区域
    function _addMessageBoardToTetrisBoard(tetrisBoard: JQuery<HTMLElement>) {
      const isGameOver = controller.app.isGameOver
      const isPause = controller.app.isPause
      if (isGameOver || isPause) {
        const messageBoard = isPause
          ? _createMessageBoard('游戏暂停')
          : _createMessageBoard('Game Over~~', '#f40')
        tetrisBoard.append(messageBoard)
      }
    }

    // 创建游戏控制面板
    function _createTetrisPanel() {
      return $('<div>').css({
        position: 'relative',
        width: (config.squareSize.width * config.windowSize.x) / 1.5,
        height: config.squareSize.height * config.windowSize.y,
        background: '#ccc',
        boxSizing: 'border-box'
      })
    }

    // 创建下一个方块组模版对象UI显示区
    function _createNextSquareGroupBoard() {
      return $('<div>').css({
        position: 'absolute',
        width: config.squareSize.width * 5,
        height: config.squareSize.height * 5,
        boxSizing: 'border-box',
        left: '50%',
        top: config.squareSize.height * config.windowSize.y * 0.25,
        transform: 'translateX(-50%)',
        background: '#000'
      })
    }

    // 添加下一个方块组模版对象UI至显示区
    function _addNextSquareGroupUIToNextSquareGroupBoard(
      nextSquareGroupBoard: JQuery<HTMLElement>
    ) {
      const nextSquareGroupUI = __createNextSquareGroupUI(controller.app.nextSquareGroup)
      nextSquareGroupUI.forEach(squareUI => {
        nextSquareGroupBoard.append(squareUI)
      })
    }

    // 创建积分显示区
    function _createPointsBoard() {
      return $('<div>')
        .css({
          position: 'absolute',
          width: config.squareSize.width * 5,
          height: config.squareSize.height * 5,
          textAlign: 'center',
          boxSizing: 'border-box',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          color: '#fff'
        })
        .append(
          $('<div>')
            .text('当前积分')
            .css({
              fontWeight: 'bold',
              fontSize: '20px',
              marginTop: config.windowSize.y * config.squareSize.height * 0.05
            })
        )
        .append(
          $('<div>')
            .text(controller.app.points)
            .css({
              fontWeight: 'bold',
              fontSize: '20px',
              marginTop: config.windowSize.y * config.squareSize.height * 0.03
            })
        )
    }

    // 创建操作按钮
    function _createButtons() {
      const color = 'rgba(255,68,0,0.8)'
      const darkenColor = __darken(color, 0.5)
      const lightenColor = __lighten(color, 0.5)
      const buttonCss: JQuery.PlainObject<
        | string
        | number
        | ((this: HTMLElement, index: number, value: string) => string | number | void | undefined)
      > = {
        fontSize: '14px',
        fontWeight: 'bold',
        width: config.squareSize.width * 4,
        height: config.squareSize.height * 2,
        lineHeight: `${config.squareSize.height * 1.3}px`,
        textAlign: 'center',
        cursor: 'pointer',
        border: `${config.squareSize.height * 0.35}px solid`,
        borderLeftColor: darkenColor,
        borderBottomColor: darkenColor,
        borderRightColor: lightenColor,
        borderTopColor: lightenColor,
        boxSizing: 'border-box',
        backgroundColor: color,
        color: '#fff',
        userSelect: 'none'
      }
      function hover(this: JQuery<HTMLElement>): JQuery<HTMLElement> {
        this.on('mousedown', () => {
          this.css({
            transform: 'scale(0.8)'
            // border: `${config.squareSize.height * 0.45}px solid`,
            // lineHeight: `${config.squareSize.height * 1.1}px`,
            // borderLeftColor: darkenColor,
            // borderBottomColor: darkenColor,
            // borderRightColor: lightenColor,
            // borderTopColor: lightenColor
          })
        })
          .on('mouseup', () => {
            this.css({
              transition: 'all 0.15s',
              transform: 'scale(1)'
            })
          })
          .on('mouseenter', () => {
            this.css({
              transition: 'none',
              color: '#000'
            }).on('mouseleave', () => {
              this.css({
                transition: 'all 0.3s',
                transform: 'scale(1)',
                color: '#fff'
              })
            })
          })
        return this
      }
      const container = $('<div>').css({
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        width: '100%',
        height: config.squareSize.height * 2,
        textAlign: 'center',
        boxSizing: 'border-box',
        left: '50%',
        top: config.squareSize.height * config.windowSize.y * 0.52,
        transform: 'translateX(-50%)'
      })
      if (controller.app.isGameOver || controller.app.isPause) {
        const restartButton = hover.call(
          $('<div>')
            .text('重新开始')
            .css(buttonCss)
            .on('mouseup', () => {
              restartButton.on('transitionend', () => {
                controller.app.gameRestart()
              })
            })
        )
        const pauseButton = hover.call(
          $('<div>')
            .text(controller.app.isPause ? '开始' : '暂停')
            .css(buttonCss)
            .on('mouseup', () => {
              pauseButton.on('transitionend', () => {
                controller.app.isPause ? controller.app.gameStart() : controller.app.gamePause()
              })
            })
        )
        if (controller.app.isPause) {
          container.append(pauseButton)
        }

        container.append(restartButton)
      }
      return container
    }

    // 创建操作说明
    function _createDescription() {
      const pcss = {
        margin: '0',
        padding: '0 0 0 20px',
        lineHeight: '1.5em',
        fontWeight: 'bold'
      }
      const p1 = $('<p>').text('↑ 键：瞬时针旋转方向').css(pcss)
      const p2 = $('<p>').text('← 键：向左移动方块').css(pcss)
      const p3 = $('<p>').text('→ 键：向右移动方块').css(pcss)
      const p4 = $('<p>').text('↓ 键：向下移动方块').css(pcss)
      const p5 = $('<p>').text('- 其他按键：').css(pcss)
      const p6 = $('<p>').text('Space：向下移动方块至底部').css(pcss)
      const p7 = $('<p>').text('Enter：暂停/继续游戏').css(pcss)

      return $('<div>')
        .css({
          position: 'absolute',
          width: '100%',
          height: config.squareSize.height * 7,
          fontSize: '12px',
          boxSizing: 'border-box',
          left: '50%',
          top: config.squareSize.height * config.windowSize.y * 0.65,
          transform: 'translateX(-50%)'
        })
        .append(p1, p2, p3, p4, p5, p6, p7)
    }
    // 注入函数
    function _inject(container: JQuery<HTMLElement>) {
      // 清空
      container.empty()

      // 创建
      const root = _createRoot()
      const tetrisBoard = _createTetrisBoard()
      _addSquareUIToTetrisBoard(tetrisBoard)
      _addMessageBoardToTetrisBoard(tetrisBoard)
      const tetrisPanel = _createTetrisPanel()
      const nextSquareGroupBoard = _createNextSquareGroupBoard()
      _addNextSquareGroupUIToNextSquareGroupBoard(nextSquareGroupBoard)
      const pointsBoard = _createPointsBoard()
      const buttons = _createButtons()
      const description = _createDescription()
      tetrisPanel.append(nextSquareGroupBoard)
      tetrisPanel.append(pointsBoard)
      tetrisPanel.append(buttons)
      tetrisPanel.append(description)
      root.append(tetrisBoard, tetrisPanel)
      // 显示
      container.append(root)
    }

    if (this._container) {
      const container = $(this._container)

      // 注入(此处使用 requestIdleCallback 避免阻塞，优化全量渲染带来的跳帧问题)
      const requestId: number = requestIdleCallback(deadline => {
        const isChange = this._tetris.render !== this
        if (isChange || this._tetris.isPause || this._tetris.isGameOver) {
          this._requestIdleCallbackIds.forEach(id => {
            cancelIdleCallback(id)
          })
          this._requestIdleCallbackIds = []
          return _inject(container)
        }
        const timeRemaining = deadline.timeRemaining()
        if (timeRemaining > 0) {
          _inject(container)
        }
      })
      this._requestIdleCallbackIds.push(requestId)
    }
  }
}
