import { defineStore } from 'pinia'
import { ref } from 'vue'

// 隐私设置类型
interface PrivacySettings {
  storageMode: 'local' | 'cloud' | 'hybrid'
  storeConversationHistory: boolean
  allowPersonalityLearning: boolean
  dataRetentionDays: number
}

// API设置类型（AI 模型与网关配置统一存于 localStorage，见 services/models.ts 与 services/storage.ts）
interface APISettings {
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
    const privacyData = localStorage.getItem('privacy_settings')
    const apiData = localStorage.getItem('api_settings')
    const aiModels = localStorage.getItem('ai_models')
    const gatewayUrl = localStorage.getItem('cloud_gateway_url')
    const gatewayToken = localStorage.getItem('cloud_gateway_token')
    const useCloudProxy = localStorage.getItem('use_cloud_proxy')
    
    if (personaData) {
      allData.persona = JSON.parse(personaData)
    }
    if (conversationData) {
      allData.conversations = JSON.parse(conversationData)
    }
    if (privacyData) {
      allData.privacy = JSON.parse(privacyData)
    }
    if (apiData) {
      allData.api = JSON.parse(apiData)
    }
    if (aiModels) {
      allData.ai_models = JSON.parse(aiModels)
    }
    if (gatewayUrl) {
      allData.cloud_gateway_url = gatewayUrl
    }
    if (gatewayToken) {
      allData.cloud_gateway_token = gatewayToken
    }
    if (useCloudProxy !== null) {
      allData.use_cloud_proxy = useCloudProxy === 'true'
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
