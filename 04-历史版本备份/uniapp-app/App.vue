<template>
  <view class="app-container">
    <App />
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { usePersonaStore } from './stores/persona'
import { useSettingsStore } from './stores/settings'

onLaunch(() => {
  console.log('App Launch')
  // 初始化数据
  const personaStore = usePersonaStore()
  const settingsStore = useSettingsStore()
  
  personaStore.loadFromStorage()
  settingsStore.loadFromStorage()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/static/styles/global.scss';

.app-container {
  width: 100%;
  height: 100%;
}
</style>
