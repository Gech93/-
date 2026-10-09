import { defineStore } from 'pinia'
import { ref } from 'vue'

// 隐私设置类型
export interface PrivacySettings {
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
  
  // 方法
  function updatePrivacySettings(settings: Partial<PrivacySettings>) {
    privacySettings.value = {
      ...privacySettings.value,
      ...settings,
    }
    saveToStorage()
    uni.showToast({ title: '设置已保存', icon: 'success' })
  }
  
  function exportData() {
    const personaData = uni.getStorageInfoSync()
    const allData: Record<string, any> = {}
    
    personaData.keys.forEach(key => {
      allData[key] = uni.getStorageSync(key)
    })
    
    const dataStr = JSON.stringify(allData, null, 2)
    const fileName = `互补数字人数据_${new Date().toISOString().split('T')[0]}.json`
    
    // 保存到本地文件
    uni.saveFile({
      tempFilePath: dataStr,
      success: (res) => {
        uni.showToast({ title: '数据导出成功', icon: 'success' })
      },
      fail: () => {
        uni.showToast({ title: '数据导出失败', icon: 'none' })
      }
    })
    
    return dataStr
  }
  
  function clearAllData() {
    uni.showModal({
      title: '确认删除',
      content: '确定要删除所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          uni.clearStorageSync()
          privacySettings.value = {
            storageMode: 'local',
            storeConversationHistory: true,
            allowPersonalityLearning: true,
            dataRetentionDays: 365,
          }
          uni.showToast({ title: '数据已清除', icon: 'success' })
        }
      }
    })
  }
  
  function saveToStorage() {
    uni.setStorageSync('privacy_settings', privacySettings.value)
  }
  
  function loadFromStorage() {
    const data = uni.getStorageSync('privacy_settings')
    if (data) {
      privacySettings.value = data
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
