import { Square } from '../core/Square'
import { Coordinate, Shape } from '../core/interfaces'

export interface TetrisRule {
  (coordinate: Coordinate, shape: Shape, squares: Square[]): boolean
}

