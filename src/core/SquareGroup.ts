import { Coordinate, Shape } from './interfaces'
import { Square } from './Square'
import { SquareDisplayController } from './controller/SquareDisplayController'

/**
 * 方块组
 */
export class SquareGroup {
  private _coordinates: readonly Coordinate[]
  private _squares: Square[]
  public get squares(): readonly Square[] {
    return [...this._squares]
  }
  public get coordinates(): readonly Coordinate[] {
    return [...this._coordinates]
  }
  public get center(): Coordinate {
    return this._center
  }
  public set center(value: Coordinate) {
    this._center = value
    // 更新
    this._update()
  }
  public get shape(): Shape {
    return this._shape
  }
  public set shape(value: Shape) {
    this._shape = value
    // 更新
    this._update()
  }
  public get color(): string {
    return this._color
  }
  public set color(value: string) {
    this._color = value
    // 更新
    this._update()
  }
  public get displayController(): SquareDisplayController | undefined {
    return this._displayController
  }
  public set displayController(value: SquareDisplayController) {
    this._displayController = value
    this._squares.forEach(square => {
      square.displayController = value
    })
  }
  constructor(
    private _center: Coordinate,
    private _shape: Shape,
    private _color: string = '#f40',
    private _displayController?: SquareDisplayController
  ) {
    this._coordinates = [
      ...this._shape.map(c => {
        const coordinate: Coordinate = {
          x: c.x + this._center.x,
          y: c.y + this._center.y
        }
        return coordinate
      })
    ]
    this._squares = this._coordinates.map(
      coordinate => new Square(coordinate, this._color, this._displayController)
    )
  }
  private _update() {
    this._coordinates = SquareGroup.computedCoordinates(this._center, this._shape)
    this._squares.forEach((square, i) => {
      square.coordinate = this._coordinates[i]
      square.color = this._color
    })
  }
  public static computedCoordinates(center: Coordinate, shape: Shape): Coordinate[] {
    return shape.map(c => {
      const coordinate: Coordinate = {
        x: c.x + center.x,
        y: c.y + center.y
      }
      return coordinate
    })
  }
}
