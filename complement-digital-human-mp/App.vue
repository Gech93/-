<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { usePersonaStore } from './stores/persona'

onLaunch(() => {
  console.log('App Launch')
  const personaStore = usePersonaStore()
  personaStore.loadFromStorage()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
page {
  background-color: #f5f5f5;
}
</style>
