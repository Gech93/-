import { defineStore } from 'pinia'
import { ref } from 'vue'

// 隐私设置类型
export interface PrivacySettings {
  storageMode: 'local' | 'cloud' | 'hybrid'
  storeConversationHistory: boolean
  allowPersonalityLearning: boolean
  dataRetentionDays: number
}

// API设置类型
interface APISettings {
  deepseekApiKey: string
  useMockAI: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const privacySettings = ref<PrivacySettings>({
    storageMode: 'local',
    storeConversationHistory: true,
    allowPersonalityLearning: true,
    dataRetentionDays: 365,
  })
  
  const apiSettings = ref<APISettings>({
    deepseekApiKey: '',
    useMockAI: true, // 默认使用模拟AI
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

  // 更新API设置
  function updateAPISettings(settings: Partial<APISettings>) {
    apiSettings.value = {
      ...apiSettings.value,
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
      apiSettings.value = {
        deepseekApiKey: '',
        useMockAI: true,
      }
      alert('数据已清除')
      window.location.reload()
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    localStorage.setItem('privacy_settings', JSON.stringify(privacySettings.value))
    localStorage.setItem('api_settings', JSON.stringify(apiSettings.value))
  }

  // 从本地存储加载
  function loadFromStorage() {
    const privacyDataStr = localStorage.getItem('privacy_settings')
    if (privacyDataStr) {
      privacySettings.value = JSON.parse(privacyDataStr)
    }
    
    const apiDataStr = localStorage.getItem('api_settings')
    if (apiDataStr) {
      apiSettings.value = JSON.parse(apiDataStr)
    }
    
    isInitialized.value = true
  }

  return {
    privacySettings,
    apiSettings,
    isInitialized,
    updatePrivacySettings,
    updateAPISettings,
    exportData,
    clearAllData,
    loadFromStorage,
  }
})
