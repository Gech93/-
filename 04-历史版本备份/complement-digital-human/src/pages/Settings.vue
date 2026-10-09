<template>
  <div class="settings-container">
    <div class="header">
      <h1 class="page-title">设置</h1>
    </div>

    <div class="settings-section">
      <p class="section-title">AI服务</p>

      <div class="setting-item">
        <div class="setting-left">
          <span class="setting-icon">☁️</span>
          <div class="setting-info">
            <span class="setting-name">云端网关兜底</span>
            <span class="setting-desc">关闭时仅使用下方直连模型；开启时，所有直连模型都失败后会自动走网关兜底一次</span>
          </div>
        </div>
        <div class="toggle-switch" :class="{ active: gatewayEnabled }" @click="toggleCloudProxy">
          <div class="toggle-dot"></div>
        </div>
      </div>

      <div class="setting-item column" v-if="gatewayEnabled">
        <label class="setting-label">网关地址（可选）</label>
        <input
          v-model="gatewayUrl"
          class="api-input full"
          placeholder="留空则使用内置网关"
          @blur="saveGatewayUrl"
        />
      </div>

      <div class="setting-item column" v-if="gatewayEnabled">
        <label class="setting-label">网关令牌（可选）</label>
        <input
          v-model="gatewayToken"
          class="api-input full"
          placeholder="留空则使用内置令牌"
          type="password"
          @blur="saveGatewayToken"
        />
      </div>

      <div class="model-list">
        <div class="model-card" v-for="(m, idx) in models" :key="idx">
          <div class="model-card-header">
            <div class="model-name-row">
              <span class="model-name">{{ m.name || '未命名模型' }}</span>
              <span class="model-tag" v-if="m.enabled">已启用</span>
              <span class="model-tag off" v-else>已停用</span>
            </div>
            <div class="model-actions">
              <button class="action-btn" @click="moveModel(idx, -1)">↑</button>
              <button class="action-btn" @click="moveModel(idx, 1)">↓</button>
              <button class="action-btn danger" @click="removeModel(idx)">删除</button>
            </div>
          </div>

          <div class="model-field">
            <label class="field-label">名称</label>
            <input v-model="m.name" class="api-input full" placeholder="如 DeepSeek / GLM / Kimi" @blur="persistModels" />
          </div>
          <div class="model-field">
            <label class="field-label">模型 ID</label>
            <input v-model="m.model" class="api-input full" placeholder="如 deepseek-chat / glm-4-plus" @blur="persistModels" />
          </div>
          <div class="model-field">
            <label class="field-label">接口地址（可选）</label>
            <input v-model="m.baseUrl" class="api-input full" placeholder="留空按模型自动推导" @blur="persistModels" />
          </div>
          <div class="model-field">
            <label class="field-label">API Key</label>
            <input v-model="m.apiKey" class="api-input full" placeholder="输入该模型的 API Key" type="password" @blur="persistModels" />
          </div>
          <div class="model-field switch-field">
            <label class="field-label">启用（参与自动切换）</label>
            <div class="toggle-switch small" :class="{ active: m.enabled }" @click="toggleModel(idx)">
              <div class="toggle-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <button class="add-model-btn" @click="addModel">＋ 添加模型</button>
      <p class="setting-hint">
        可配置多个模型，对话时按顺序尝试；某个模型请求失败或回复无法解析时自动切换下一个，全部失败再由网关兜底
      </p>
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
            <span class="setting-desc">v1.2.0 多模型 AI 版本</span>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import { usePersonaStore } from '../stores/persona'
import TabBar from '../components/TabBar.vue'
import { readModels, type UserModelConfig } from '../services/models'
import { readStorage, writeStorage, STORAGE_KEYS } from '../services/storage'

const router = useRouter()
const settingsStore = useSettingsStore()
const personaStore = usePersonaStore()

const showAbout = ref(false)

const models = ref<UserModelConfig[]>(readModels(readStorage))
const gatewayEnabled = ref(readStorage(STORAGE_KEYS.useCloudProxy) !== false)
const gatewayUrl = ref((readStorage<string>(STORAGE_KEYS.cloudGatewayUrl) as string) || '')
const gatewayToken = ref((readStorage<string>(STORAGE_KEYS.cloudGatewayToken) as string) || '')

function persistModels() {
  writeStorage(STORAGE_KEYS.aiModels, models.value)
}

function addModel() {
  models.value.push({ name: '', model: '', baseUrl: '', apiKey: '', jsonMode: true, enabled: true })
  persistModels()
  alert('已添加模型，请填写模型 ID 与 API Key')
}

function removeModel(idx: number) {
  if (models.value.length === 1) {
    alert('至少保留一个模型')
    return
  }
  models.value.splice(idx, 1)
  persistModels()
}

function moveModel(idx: number, dir: -1 | 1) {
  const to = idx + dir
  if (to < 0 || to >= models.value.length) return
  const [item] = models.value.splice(idx, 1)
  models.value.splice(to, 0, item)
  persistModels()
}

function toggleModel(idx: number) {
  models.value[idx].enabled = !models.value[idx].enabled
  persistModels()
}

function toggleCloudProxy() {
  gatewayEnabled.value = !gatewayEnabled.value
  writeStorage(STORAGE_KEYS.useCloudProxy, gatewayEnabled.value)
}

function saveGatewayUrl() {
  writeStorage(STORAGE_KEYS.cloudGatewayUrl, gatewayUrl.value.trim())
}

function saveGatewayToken() {
  writeStorage(STORAGE_KEYS.cloudGatewayToken, gatewayToken.value.trim())
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

.api-input.full {
  width: 100%;
  box-sizing: border-box;
}

.api-input:focus {
  border-color: #667eea;
}

.setting-item.column {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: #999999;
}

.setting-hint {
  font-size: 12px;
  color: #999999;
  line-height: 1.5;
  padding: 12px 20px;
  margin: 0;
}

.model-list {
  padding: 0 20px 12px;
}

.model-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.model-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.model-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
}

.model-tag {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  padding: 2px 8px;
}

.model-tag.off {
  color: #999999;
  background: transparent;
}

.model-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 10px;
  font-size: 13px;
  color: #666666;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.action-btn.danger {
  color: #ff3b30;
}

.model-field {
  margin-bottom: 12px;
}

.model-field.switch-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #999999;
  margin-bottom: 6px;
}

.switch-field .field-label {
  margin-bottom: 0;
}

.toggle-switch.small {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  flex-shrink: 0;
}

.toggle-switch.small .toggle-dot {
  width: 22px;
  height: 22px;
  top: 2px;
  left: 2px;
}

.toggle-switch.small.active .toggle-dot {
  transform: translateX(18px);
}

.add-model-btn {
  display: block;
  width: calc(100% - 40px);
  margin: 0 20px;
  padding: 12px 0;
  text-align: center;
  font-size: 15px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
  border: 1px dashed #667eea;
  border-radius: 12px;
  cursor: pointer;
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
