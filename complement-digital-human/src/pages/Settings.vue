<template>
  <div class="settings-container">
    <div class="header">
      <h1 class="page-title">设置</h1>
    </div>

    <div class="settings-section">
      <p class="section-title">AI设置</p>
      
      <div class="setting-item">
        <div class="setting-left">
          <span class="setting-icon">🔑</span>
          <div class="setting-info">
            <span class="setting-name">DeepSeek API Key</span>
            <span class="setting-desc">输入你的API密钥以启用真实AI</span>
          </div>
        </div>
        <input
          type="password"
          class="api-input"
          v-model="apiKey"
          placeholder="输入API Key"
          @input="handleApiKeyChange"
        />
      </div>

      <div class="setting-item">
        <div class="setting-left">
          <span class="setting-icon">🤖</span>
          <div class="setting-info">
            <span class="setting-name">使用模拟AI</span>
            <span class="setting-desc">关闭后将使用DeepSeek真实AI</span>
          </div>
        </div>
        <div class="toggle-switch" :class="{ active: settingsStore.apiSettings.useMockAI }" @click="toggleMockAI">
          <div class="toggle-dot"></div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <p class="section-title">隐私与数据</p>
      
      <div class="setting-item" @click="goToPrivacy">
        <div class="setting-left">
          <span class="setting-icon">🔒</span>
          <div class="setting-info">
            <span class="setting-name">隐私设置</span>
            <span class="setting-desc">管理你的数据存储方式</span>
          </div>
        </div>
        <span class="setting-arrow">›</span>
      </div>

      <div class="setting-item" @click="handleExport">
        <div class="setting-left">
          <span class="setting-icon">📤</span>
          <div class="setting-info">
            <span class="setting-name">导出数据</span>
            <span class="setting-desc">下载你的所有数据</span>
          </div>
        </div>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <div class="settings-section">
      <p class="section-title">关于</p>
      
      <div class="setting-item">
        <div class="setting-left">
          <span class="setting-icon">ℹ️</span>
          <div class="setting-info">
            <span class="setting-name">版本信息</span>
            <span class="setting-desc">v1.1.0 DeepSeek AI版本</span>
          </div>
        </div>
      </div>

      <div class="setting-item" @click="showAbout = true">
        <div class="setting-left">
          <span class="setting-icon">🤖</span>
          <div class="setting-info">
            <span class="setting-name">关于互补数字人</span>
            <span class="setting-desc">了解产品理念和功能</span>
          </div>
        </div>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <div class="settings-section">
      <p class="section-title">账户</p>
      
      <div class="setting-item danger" @click="handleClearData">
        <div class="setting-left">
          <span class="setting-icon">🗑️</span>
          <div class="setting-info">
            <span class="setting-name">清除所有数据</span>
            <span class="setting-desc">删除账户和所有历史数据</span>
          </div>
        </div>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <div class="about-card">
      <span class="about-icon">🤖</span>
      <p class="about-title">互补数字人</p>
      <p class="about-desc">
        一个与你人格互补的AI伙伴，帮助你在决策犹豫时获得不同视角。
      </p>
      <div class="about-features">
        <span class="feature-tag">🧠 MBTI人格测试</span>
        <span class="feature-tag">💬 AI对话</span>
        <span class="feature-tag">🎯 决策辅助</span>
        <span class="feature-tag">📈 持续成长</span>
      </div>
    </div>

    <div class="footer-info">
      <span>© 2025 互补数字人</span>
      <span>用AI发现另一个视角</span>
    </div>

    <div class="about-modal" v-if="showAbout" @click="showAbout = false">
      <div class="modal-content" @click.stop>
        <p class="modal-title">关于互补数字人</p>
        
        <div class="about-section">
          <p class="about-section-title">💡 产品理念</p>
          <p class="about-section-text">
            每个人都有自己的思维盲区，这个数字人能帮助你从另一个角度看待问题。
            它不是要取代你的思考，而是补充和扩展你的视野。
          </p>
        </div>

        <div class="about-section">
          <p class="about-section-title">🎯 核心功能</p>
          <p class="about-section-text">
            • MBTI人格测试：发现你的性格特点<br/>
            • 互补人格：生成与你互补的AI人格<br/>
            • 决策辅助：在重要决策时提供不同视角<br/>
            • 持续成长：随着使用不断学习和进化
          </p>
        </div>

        <div class="about-section">
          <p class="about-section-title">🔒 隐私保护</p>
          <p class="about-section-text">
            你的数据由你掌控。我们提供多种数据存储方式，所有数据处理都遵循严格的隐私保护原则。
          </p>
        </div>

        <button class="modal-close" @click="showAbout = false">我知道了</button>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import { usePersonaStore } from '../stores/persona'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const personaStore = usePersonaStore()

const showAbout = ref(false)
const apiKey = ref('')

onMounted(() => {
  apiKey.value = settingsStore.apiSettings.deepseekApiKey
})

function handleApiKeyChange() {
  settingsStore.updateAPISettings({ deepseekApiKey: apiKey.value })
}

function toggleMockAI() {
  settingsStore.updateAPISettings({ useMockAI: !settingsStore.apiSettings.useMockAI })
}

function goToPrivacy() {
  router.push('/settings/privacy')
}

function handleExport() {
  const data = settingsStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `互补数字人数据_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleClearData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    settingsStore.clearAllData()
    personaStore.loadFromStorage()
    router.push('/')
  }
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.settings-section {
  background: #ffffff;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
}

.section-title {
  font-size: 14px;
  color: #999999;
  padding: 16px 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:active {
  background: #f5f5f5;
}

.setting-item.danger .setting-icon {
  background: rgba(255, 59, 48, 0.1);
}

.setting-item.danger .setting-name {
  color: #ff3b30;
}

.setting-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.setting-icon {
  width: 48px;
  height: 48px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.setting-desc {
  display: block;
  font-size: 14px;
  color: #999999;
}

.setting-arrow {
  font-size: 24px;
  color: #cccccc;
  margin-left: 16px;
}

.about-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  margin-top: 24px;
}

.about-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.about-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
}

.about-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 24px;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #ffffff;
}

.footer-info {
  text-align: center;
  padding: 40px 0;
}

.footer-info span {
  display: block;
  font-size: 14px;
  color: #999999;
  margin-bottom: 6px;
}

.about-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 22px;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 28px;
}

.about-section {
  margin-bottom: 24px;
}

.about-section-title {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 12px;
}

.about-section-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.modal-close {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border-radius: 26px;
  border: none;
  margin-top: 24px;
}

.api-input {
  width: 200px;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.api-input:focus {
  border-color: #667eea;
}

.toggle-switch {
  width: 52px;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-dot {
  width: 26px;
  height: 26px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-dot {
  transform: translateX(22px);
}
</style>
