import type { Ref } from 'vue'
import type { BlockState } from '~/types'

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

type GameStatus = 'play' | 'won' | 'lost'
interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
}
export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      mineGenerated: false,
      status: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            adjacentMines: 0,
            revealed: false,
          }),
        ),
      ),
    }
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.randomRange(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((raw) => {
      raw.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block)
      .forEach((s) => {
        if (!s.revealed) {
          s.revealed = true
          this.expendZero(s)
        }
      })
  }

  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }

    block.revealed = true
    if (block.mine) {
      // this.state.value.status = 'lost'
      // alert('BOOOOM!')
      this.onGameOver('lost')
    }
    this.expendZero(block)
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  checkGameState() {
    if (!this.state.value.mineGenerated)
      return
    if (this.blocks.every(block => block.revealed || block.flagged)) {
      if (this.blocks.some(block => block.flagged && !block.mine)) {
        // this.state.value.status = 'lost'
        // alert('You cheat!')
        this.onGameOver('lost')
      }
      else {
        // this.state.value.status = 'won'
        // alert('You win!')
        this.onGameOver('won')
      }
    }
  }

  showAllBooms() {
    this.blocks.forEach((block) => {
      if (block.mine)
        block.revealed = true
    })
  }

  onGameOver(status: GameStatus) {
    this.state.value.status = status
    if (status === 'lost')
      this.showAllBooms()
  }
}
