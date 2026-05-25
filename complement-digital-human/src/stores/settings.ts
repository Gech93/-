import { defineStore } from 'pinia'
import { ref } from 'vue'

// 隐私设置类型
interface PrivacySettings {
  storageMode: 'local' | 'cloud' | 'hybrid'
  storeConversationHistory: boolean
  allowPersonalityLearning: boolean
  dataRetentionDays: number
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const privacySettings = ref<PrivacySettings>({
    storageMode: 'local',
    storeConversationHistory: true,
    allowPersonalityLearning: true,
    dataRetentionDays: 365,
  })
  
  const isInitialized = ref(false)

  // 更新隐私设置
  function updatePrivacySettings(settings: Partial<PrivacySettings>) {
    privacySettings.value = {
      ...privacySettings.value,
      ...settings,
    }
    saveToStorage()
  }

  // 导出数据
  function exportData(): string {
    const allData: Record<string, any> = {}
    
    const personaData = localStorage.getItem('persona_data')
    const conversationData = localStorage.getItem('conversations')
    
    if (personaData) {
      allData.persona = JSON.parse(personaData)
    }
    if (conversationData) {
      allData.conversations = JSON.parse(conversationData)
    }
    
    return JSON.stringify(allData, null, 2)
  }

  // 清除所有数据
  function clearAllData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear()
      privacySettings.value = {
        storageMode: 'local',
        storeConversationHistory: true,
        allowPersonalityLearning: true,
        dataRetentionDays: 365,
      }
      alert('数据已清除')
      window.location.reload()
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    localStorage.setItem('privacy_settings', JSON.stringify(privacySettings.value))
  }

  // 从本地存储加载
  function loadFromStorage() {
    const dataStr = localStorage.getItem('privacy_settings')
    if (dataStr) {
      privacySettings.value = JSON.parse(dataStr)
    }
    isInitialized.value = true
  }

  return {
    privacySettings,
    isInitialized,
    updatePrivacySettings,
    exportData,
    clearAllData,
    loadFromStorage,
  }
})
