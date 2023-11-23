import $ from 'jquery'
import { Tetris } from './tetris/Tetris'

const container = $('#app')
const tetris = new Tetris()
tetris.mount(container)

$('.down').on('click', () => {
  tetris.move({ x: 0, y: 1 })
})
$('.left').on('click', () => {
  tetris.move({ x: -1, y: 0 })
})
$('.right').on('click', () => {
  tetris.move({ x: 1, y: 0 })
})
$('.color').on('click', () => {
  tetris.changeColor(tetris.getRadomColor())
})
$('.rotate').on('click', () => {
  tetris.rotate()
})
$('.bottom').on('click', () => {
  tetris.dropToBottom()
})
$('.points').on('click', () => {
  console.log(tetris.points)
})
$('.pause').on('click', () => {
  tetris.gamePause()
})
$('.restart').on('click', () => {
  tetris.gameRestart()
})

function randomColor() {
  return '#' + Math.random().toString(16).slice(2, 8)
}

function test(t: any, ctx: ClassFieldDecoratorContext, ...args: any[]) {
  console.log(t)
  console.log(ctx)  
  console.log(args)
}

class A {
  @test
  private prop1: string = '1'
}
const a = new A()
