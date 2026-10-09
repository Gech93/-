<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePersonaStore } from './stores/persona'
import { useSettingsStore } from './stores/settings'
import { useConversation } from './stores/conversation'

const personaStore = usePersonaStore()
const settingsStore = useSettingsStore()
const conversation = useConversation()

onMounted(() => {
  personaStore.loadFromStorage()
  settingsStore.loadFromStorage()
  conversation.loadFromStorage()
})
</script>

<style>
.app-container {
  min-height: 100vh;
}
</style>
