import { DisplayController } from '../controller/DisplayController'
import { DisplayRender } from './DisplayRender'

/**
 * 显示器
 */
export class Display {
  private _controller?: DisplayController
  private _render?: DisplayRender
  public setController(controller: DisplayController) {
    this._controller = controller
  }
  public setRender(render: DisplayRender) {
    this._render = render
  }
  public draw() {
    if (this._render && this._controller) {
      this._render.render(this._controller)
    }
  }
}
