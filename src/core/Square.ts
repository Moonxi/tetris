import { Coordinate } from './interfaces'
import { SquareDisplayController } from './controller/SquareDisplayController'

/**
 * 小方块
 */
export class Square {
  constructor(
    private _coordinate: Coordinate, // 坐标
    private _color: string, // 颜色
    private _displayController?: SquareDisplayController // 显示控制器
  ) {}

  public get coordinate(): Coordinate {
    return this._coordinate
  }
  public set coordinate(value: Coordinate) {
    this._coordinate = value
    // 每次数据变化时，通知控制器
    if (this._displayController) {
      this._displayController.receive()
    }
  }
  public get displayController(): SquareDisplayController | undefined {
    return this._displayController
  }
  public set displayController(value: SquareDisplayController) {
    this._displayController = value
  }
  public get color(): string {
    return this._color
  }
  public set color(value: string) {
    this._color = value
    // 每次数据变化时，通知控制器
    if (this._displayController) {
      this._displayController.receive()
    }
  }
}
