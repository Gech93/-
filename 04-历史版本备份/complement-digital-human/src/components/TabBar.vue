<template>
  <div class="tab-bar">
    <div 
      class="tab-item" 
      :class="{ active: currentTab === 'persona' }"
      @click="navigateTo('/persona')"
    >
      <span class="tab-icon">👤</span>
      <span class="tab-label">人格</span>
    </div>
    <div 
      class="tab-item" 
      :class="{ active: currentTab === 'chat' }"
      @click="navigateTo('/chat')"
    >
      <span class="tab-icon">💬</span>
      <span class="tab-label">对话</span>
    </div>
    <div 
      class="tab-item" 
      :class="{ active: currentTab === 'settings' }"
      @click="navigateTo('/settings')"
    >
      <span class="tab-icon">⚙️</span>
      <span class="tab-label">设置</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentTab = computed(() => {
  if (route.path.includes('/persona')) return 'persona'
  if (route.path.includes('/chat')) return 'chat'
  if (route.path.includes('/settings')) return 'settings'
  return ''
})

function navigateTo(path: string) {
  router.push(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #999999;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #667eea;
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  font-size: 12px;
}
</style>
