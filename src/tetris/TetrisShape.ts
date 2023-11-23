import { Shape } from '../core/interfaces'
import { Coordinate } from '../core/interfaces'

export class TetrisShape {
  private static _instance: TetrisShape
  private _shapes: Shape[][]
  private _shapesI: Shape[] = [
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -2, y: 0 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: -2 }
    ]
  ]
  private _shapesJ: Shape[] = [
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: -1 }
    ]
  ]
  private _shapesL: Shape[] = [
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: -1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: -1 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 1 }
    ]
  ]
  private _shapesO: Shape[] = [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ]
  ]

  private _shapesS: Shape[] = [
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 1 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 }
    ],
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ]
  ]
  private _shapesT: Shape[] = [
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 0 }
    ]
  ]
  private _shapesZ: Shape[] = [
    [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: -1 }
    ],
    [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 }
    ],
    [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 }
    ]
  ]
  private _getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min)
  }
  private constructor() {
    this._shapes = [
      this._shapesI,
      this._shapesJ,
      this._shapesL,
      this._shapesO,
      this._shapesS,
      this._shapesT,
      this._shapesZ
    ]
  }
  public static get instance(): TetrisShape {
    if (!TetrisShape._instance) {
      TetrisShape._instance = new TetrisShape()
    }
    return TetrisShape._instance
  }
  public get shapes(): readonly Shape[][] {
    return [...this._shapes]
  }
  public get I(): Shape[] {
    return this._shapesI
  }
  public get J(): Shape[] {
    return this._shapesJ
  }
  public get L(): Shape[] {
    return this._shapesL
  }
  public get O(): Shape[] {
    return this._shapesO
  }
  public get S(): Shape[] {
    return this._shapesS
  }
  public get T(): Shape[] {
    return this._shapesT
  }
  public get Z(): Shape[] {
    return this._shapesZ
  }
  public get initialI(): Shape {
    return this._shapesI[0]
  }
  public get initialJ(): Shape {
    return this._shapesJ[0]
  }
  public get initialL(): Shape {
    return this._shapesL[0]
  }
  public get initialO(): Shape {
    return this._shapesO[0]
  }
  public get initialS(): Shape {
    return this._shapesS[0]
  }
  public get initialT(): Shape {
    return this._shapesT[0]
  }
  public get initialZ(): Shape {
    return this._shapesZ[0]
  }
  public getRandomInitialShape(): Shape {
    const random = this._getRandom(0, this._shapes.length)
    return this._shapes[random][0]
  }
  public getRandomShape(): Shape {
    const random = this._getRandom(0, this._shapes.length)
    const randomShape = this._shapes[random]
    const randomShapeIndex = this._getRandom(0, randomShape.length)
    return randomShape[randomShapeIndex]
  }
  public rotateClockwiseNinetyDegrees(shape: Shape) {
    const newShape: Shape = shape.map(coordinate => {
      const newCoordinate: Coordinate = {
        x: -coordinate.y,
        y: coordinate.x
      }
      return newCoordinate
    })
    return newShape
  }
  public rotateCounterclockwiseNinetyDegrees(shape: Shape) {
    const newShape: Shape = shape.map(coordinate => {
      const newCoordinate: Coordinate = {
        x: coordinate.y,
        y: -coordinate.x
      }
      return newCoordinate
    })
    return newShape
  }
}
