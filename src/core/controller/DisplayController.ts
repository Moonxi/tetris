import { Display } from '../display/Display'

export abstract class DisplayController {
  abstract readonly name: string // 控制器名称
  abstract connect(display: Display): void // 连接显示器
  abstract send(): void // 发送数据
  abstract receive(): void // 接收通知
}
