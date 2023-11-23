export interface Coordinate {
  readonly x: number
  readonly y: number
}

export interface Shape extends ReadonlyArray<Coordinate> {}
