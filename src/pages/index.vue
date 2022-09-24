<script setup lang="ts">
import type { BlockState } from '~/types'
const WIDTH = 5
const HEIGHT = 5
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      }),
    )),
)
const directions = [
  [1, 0],
  [1, 1],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [-1, 1],
]
const dev = false
let mineGenerated = false
function gernerateMines(inital: BlockState) {
  for (const row of state) {
    for (const block of row) {
      if (Math.abs(inital.x - block.x) <= 1 && Math.abs(inital.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.2
    }
  }
  updateNumbers()
}
function updateNumbers() {
  state.forEach((raw, y) => {
    raw.forEach((block, x) => {
      if (block.mine)
        return
      getSibings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines += 1
      })
    })
  })
}
function getSibings(block: BlockState): BlockState[] {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 < 0 || y2 < 0 || x2 >= WIDTH || y2 >= HEIGHT)
      return undefined
    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
}
function expandZero(block: BlockState) {
  if (block.adjacentMines)
    return
  getSibings(block).forEach((b) => {
    if (!b.revealed) {
      b.revealed = true
      expandZero(b)
    }
  })
}
function onClick(block: BlockState) {
  if (block.mine) {
    alert('BOOM!!')
    showAllBooms()
  }

  if (!mineGenerated) {
    // console.log(`click: (${block.x}, ${block.y})`)
    gernerateMines(block)
    mineGenerated = true
  }
  expandZero(block)
  block.revealed = true
  checkGameState()
}
function onRightClick(block: BlockState) {
  block.flagged = !block.flagged

  checkGameState()
}
function showAllBooms() {
  const stateFlat = state.flat()
  stateFlat.forEach((s) => {
    if (s.mine)
      s.revealed = true
  })
}
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',
]

function getBlockClass(block: BlockState) {
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/10'

  return block.mine
    ? 'bg-red-500/50'
    : numberColors[block.adjacentMines]
}
function checkGameState() {
  const stateFlat = state.flat()
  console.log(stateFlat)
  if (stateFlat.every(s => s.revealed || s.flagged)) {
    if (stateFlat.some(t => t.flagged && !t.mine)) {
      alert('you lost!!')
      showAllBooms()
    }
    else {
      alert('you win!!')
    }
  }
}
</script>

<template>
  <div>
    Minesweeper
    <div
      v-for="row, y in state"
      :key="y"
      flex="~"
      items-center justify-center
    >
      <button
        v-for="block, x in row"
        :key="x"
        flex="~"
        items-center justify-center
        w-10 h-10 m="0.5"
        border="1 gray-400/10"
        :class="getBlockClass(block)"
        @click="onClick(block)"
        @contextmenu.prevent="onRightClick(block)"
      >
        <template v-if="block.flagged">
          <div i-mdi-flag text-red />
        </template>
        <template v-else-if="block.revealed || dev">
          <div v-if="block.mine" i-mdi-mine />
          <div v-else-if="block.adjacentMines">
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>
</template>
