import { DisplayController } from '../controller/DisplayController'

export abstract class DisplayRender {
  abstract render(controller: DisplayController): void // 渲染显示器
}
