import { Square } from '../Square'
import { DisplayController } from './DisplayController'
import { Coordinate, Shape } from '../interfaces'
import { Display } from '../display/Display'
import { SquareGroup } from '../SquareGroup'

/**
 * 方块控制器
 */
export class SquareDisplayController extends DisplayController {
  public readonly name: string = 'square'
  private _squares: Square[] = []
  private _squareGroups: SquareGroup[] = []
  private _display?: Display

  public get squares(): readonly Square[] {
    return [...this._squares]
  }
  public get squareGroups(): readonly SquareGroup[] {
    return [...this._squareGroups]
  }
  public connect(display: Display): void {
    this._display = display
    display.setController(this)
  }
  public send(): void {
    if (this._display) {
      this._display.draw()
    }
  }
  public receive() {
    this.send()
  }
  /**
   * 新建一个小方块
   */
  public createSquare(coordinate: Coordinate = { x: 0, y: 0 }, color: string = '#f40') {
    const square = new Square(coordinate, color, this)
    this._squares.push(square)
    return square
  }
  /**
   * 新建一个方块组
   */
  public createSquareGroup(center: Coordinate, shape: Shape, color: string = '#f40') {
    const squareGroup = new SquareGroup(center, shape, color, this)
    this._squareGroups.push(squareGroup)
    this._squares.push(...squareGroup.squares)
    return squareGroup
  }

  /**
   * 修改小方块颜色
   */
  public changeSquareColor(square: Square, color: string) {
    square.color = color
  }
  /**
   * 修改方块组颜色
   */
  public changeSquareGroupColor(squareGroup: SquareGroup, color: string) {
    squareGroup.color = color
  }

  /**
   * 移动小方块至指定坐标
   */
  public moveSquare(square: Square, coordinate: Coordinate) {
    square.coordinate = coordinate
  }
  /**
   * 移动方块组（中心点）至指定坐标
   */
  public moveSquareGroup(squareGroup: SquareGroup, coordinate: Coordinate) {
    squareGroup.center = coordinate
  }
  /**
   * 修改方块组形状
   */
  public changeSquareGroupShape(squareGroup: SquareGroup, shape: Shape) {
    squareGroup.shape = shape
  }

  /**
   * 删除小方块
   */
  public deleteSquare(square: Square) {
    const index = this._squares.indexOf(square)
    if (index !== -1) {
      this._squares.splice(index, 1)
    }
  }
  /**
   * 删除方块组
   */
  public deleteSquareGroup(squareGroup: SquareGroup) {
    const index = this._squareGroups.indexOf(squareGroup)
    if (index !== -1) {
      this._squareGroups.splice(index, 1)
      squareGroup.squares.forEach(square => this.deleteSquare(square))
    }
  }
}
