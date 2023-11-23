import { SquareDisplayController } from '../core/controller/SquareDisplayController'
import { Tetris } from './Tetris'

export class TetrisDisplayController extends SquareDisplayController {
  constructor(private _app : Tetris) {
    super()
  }
  public get app(): Tetris {
    return this._app
  }
  /**
   * 设置该控制器的应用
   */
  public setApp(app: Tetris) {
    this._app = app
  }
}
