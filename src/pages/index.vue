<!-- eslint-disable no-console -->
<!-- eslint-disable no-alert -->
<script setup lang="ts">
import MineBlock from '../components/MineBlock.vue'
import { GamePlay, isDev, toggleDev } from '~/composables'
const play = new GamePlay(5, 5, 1)
const state = computed(() => play.board)
const mines = computed(() => play.mines)
useStorage('vue-minesweeper', play.state)
watchEffect(() => {
  play.checkGameState()
})
watch(state, () => {
  console.log('watch state')
})
</script>

<template>
  <div>
    Minesweeper

    <div>{{ mines }}</div>
    <div p5 w-full overflow-auto>
      <div
        v-for="row, y in state"
        :key="y"
        flex="~"
        items-center justify-center
      >
        <MineBlock
          v-for="block, x in row"
          :key="x"
          :block="block"
          @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? "DEV" : "NORMAL" }}
      </button>
      <button btn @click="play.reset()">
        RESET
      </button>
    </div>
    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>
