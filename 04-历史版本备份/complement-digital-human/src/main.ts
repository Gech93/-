import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/global.css'
import App from './App.vue'
import { usePersonaStore } from './stores/persona'
import { useConversation } from './stores/conversation'
import { useSettingsStore } from './stores/settings'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 应用挂载后初始化 store 数据
app.mount('#app')

// 初始化 store
const personaStore = usePersonaStore()
const conversationStore = useConversation()
const settingsStore = useSettingsStore()
personaStore.loadFromStorage()
conversationStore.loadFromStorage()
settingsStore.loadFromStorage()
