<template>
  <view class="settings-container">
    <view class="header">
      <text class="page-title">设置</text>
    </view>

    <view class="settings-group">
      <text class="group-title">关于</text>
      
      <view class="setting-item">
        <text class="setting-label">版本</text>
        <text class="setting-value">{{ appVersion }}</text>
      </view>
      
      <view class="setting-item">
        <text class="setting-label">类型</text>
        <text class="setting-value">微信小程序版</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">数据管理</text>
      
      <view class="setting-item" @click="exportBackup">
        <text class="setting-label">导出数据备份</text>
        <text class="setting-arrow">→</text>
      </view>
      <view class="setting-hint">导出包含人格、测评结果、记忆与全部对话记录</view>

      <view class="setting-item" @click="importBackup">
        <text class="setting-label">导入数据备份</text>
        <text class="setting-arrow">→</text>
      </view>
      <view class="setting-hint">导入将覆盖当前全部数据，请谨慎操作</view>

      <view class="setting-item" @click="clearConversations">
        <text class="setting-label">清空全部对话</text>
        <text class="setting-arrow">→</text>
      </view>
      <view class="setting-hint">只删除对话记录，保留人格与记忆</view>

      <view class="setting-item" @click="clearData">
        <text class="setting-label danger">清除所有数据</text>
        <text class="setting-arrow">→</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">AI 服务</text>

      <view class="setting-item">
        <text class="setting-label">使用内置 AI 网关</text>
        <switch :checked="useCloudProxy" @change="toggleCloudProxy" color="#ff6b9d" />
      </view>
      <view class="setting-hint" v-if="useCloudProxy && !gatewayUrl">
        内置网关已启用，无需任何配置即可使用 AI 对话能力
      </view>
      <view class="setting-hint" v-else-if="useCloudProxy && gatewayUrl">
        正在使用你配置的自定义网关地址
      </view>
      <view class="setting-hint" v-else>
        已关闭网关，请在下方填写你自己的 DeepSeek API Key
      </view>

      <view class="setting-item column" v-if="useCloudProxy">
        <text class="setting-label">自定义网关地址（可选）</text>
        <input
          v-model="gatewayUrl"
          class="setting-input"
          placeholder="留空则使用内置网关"
          @blur="saveGatewayUrl"
        />
        <text class="setting-hint">如需使用自部署的 uniCloud 网关，请填写云函数 URL</text>
      </view>

      <view class="setting-item column" v-if="useCloudProxy">
        <text class="setting-label">自定义网关令牌（可选）</text>
        <input
          v-model="gatewayToken"
          class="setting-input"
          placeholder="留空则使用内置令牌"
          password
          @blur="saveGatewayToken"
        />
      </view>

      <view class="setting-item column">
        <text class="setting-label">AI 模型</text>
        <picker
          mode="selector"
          :range="modelLabels"
          :value="modelIndex"
          @change="onModelChange"
        >
          <view class="setting-input model-picker">{{ modelLabels[modelIndex] }}</view>
        </picker>
        <text class="setting-hint">网关模式支持预设模型；自定义模型需关闭网关并填写 API Key 直连</text>
      </view>

      <view class="setting-item column" v-if="aiModel === CUSTOM_MODEL_ID">
        <text class="setting-label">自定义模型名称</text>
        <input
          v-model="customModelName"
          class="setting-input"
          placeholder="如 qwen-plus / gpt-3.5-turbo"
          @blur="saveCustomModelName"
        />
      </view>

      <view class="setting-item column" v-if="aiModel === CUSTOM_MODEL_ID">
        <text class="setting-label">接口地址（OpenAI 兼容）</text>
        <input
          v-model="aiBaseUrl"
          class="setting-input"
          placeholder="如 https://api.openai.com/v1/chat/completions"
          @blur="saveAiBaseUrl"
        />
      </view>

      <view class="setting-item column" v-if="!useCloudProxy">
        <text class="setting-label">DeepSeek API Key</text>
        <input
          v-model="apiKey"
          class="setting-input"
          placeholder="输入你的 DeepSeek API Key"
          password
          @blur="saveApiKey"
        />
        <text class="setting-hint">从 platform.deepseek.com 获取 API Key，填入后可直连 AI</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">功能</text>

      <view class="setting-hint">测评结果基于轻量自研算法生成，仅供自我探索与参考，不构成专业人格评估</view>

      <view class="setting-item" @click="goToMbti">
        <text class="setting-label">重新测试MBTI</text>
        <text class="setting-arrow">→</text>
      </view>

      <view class="setting-item" @click="goToBigFive">
        <text class="setting-label">大五人格测评</text>
        <text class="setting-value">{{ personaStore.isBigFiveTestCompleted ? '已完成' : '未完成' }}</text>
      </view>
      
      <view class="setting-item" @click="goToPersona">
        <text class="setting-label">管理人格</text>
        <text class="setting-arrow">→</text>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">互补数字人</text>
      <text class="footer-subtext">遇见另一个视角的你</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePersonaStore } from '../../stores/persona'
import { buildBackupJson, importBackupJson, clearAllConversations } from '../../utils/backup'
import { readStorage, writeStorage, STORAGE_KEYS } from '../../utils/storage'
import { MODEL_OPTIONS, CUSTOM_MODEL_ID } from '../../pages/chat-conversation/modules/models'
import manifest from '../../manifest.json'

const personaStore = usePersonaStore()

const appVersion = `v${manifest.versionName || '1.0.0'}`

const useCloudProxy = ref(readStorage(STORAGE_KEYS.useCloudProxy) !== false)
const gatewayUrl = ref((readStorage<string>(STORAGE_KEYS.cloudGatewayUrl) as string) || '')
const gatewayToken = ref((readStorage<string>(STORAGE_KEYS.cloudGatewayToken) as string) || '')
const apiKey = ref((readStorage<string>(STORAGE_KEYS.deepseekApiKey) as string) || '')

const aiModel = ref((readStorage<string>(STORAGE_KEYS.aiModel) as string) || 'deepseek-chat')
const customModelName = ref((readStorage<string>(STORAGE_KEYS.aiCustomModel) as string) || '')
const aiBaseUrl = ref((readStorage<string>(STORAGE_KEYS.aiBaseUrl) as string) || '')

const modelLabels = MODEL_OPTIONS.map(m => m.label).concat('自定义模型（直连）')
const modelIndex = modelLabels.indexOf(
  MODEL_OPTIONS.find(m => m.id === aiModel.value)?.label || modelLabels[modelLabels.length - 1]
) === -1
  ? modelLabels.length - 1
  : Math.max(0, MODEL_OPTIONS.findIndex(m => m.id === aiModel.value))

function onModelChange(e: Event) {
  const detail = (e as unknown as { detail?: { value?: number } }).detail
  const idx = detail?.value ?? 0
  const opt = idx >= 0 && idx < MODEL_OPTIONS.length ? MODEL_OPTIONS[idx] : null
  aiModel.value = opt ? opt.id : CUSTOM_MODEL_ID
  writeStorage(STORAGE_KEYS.aiModel, aiModel.value)
  uni.showToast({
    title: `已切换模型: ${modelLabels[idx]}`,
    icon: 'none'
  })
}

function saveCustomModelName() {
  writeStorage(STORAGE_KEYS.aiCustomModel, customModelName.value.trim())
  uni.showToast({ title: '模型名称已保存', icon: 'none' })
}

function saveAiBaseUrl() {
  writeStorage(STORAGE_KEYS.aiBaseUrl, aiBaseUrl.value.trim())
  uni.showToast({ title: '接口地址已保存', icon: 'none' })
}

function toggleCloudProxy(e: Event) {
  const detail = (e as unknown as { detail?: { value?: boolean } }).detail
  useCloudProxy.value = detail?.value ?? !useCloudProxy.value
  writeStorage(STORAGE_KEYS.useCloudProxy, useCloudProxy.value)
  uni.showToast({
    title: useCloudProxy.value ? '已启用云端网关' : '已关闭云端网关',
    icon: 'none'
  })
}

function saveGatewayUrl() {
  writeStorage(STORAGE_KEYS.cloudGatewayUrl, gatewayUrl.value.trim())
  uni.showToast({
    title: '网关地址已保存',
    icon: 'none'
  })
}

function saveGatewayToken() {
  writeStorage(STORAGE_KEYS.cloudGatewayToken, gatewayToken.value.trim())
  uni.showToast({
    title: '网关令牌已保存',
    icon: 'none'
  })
}

function saveApiKey() {
  writeStorage(STORAGE_KEYS.deepseekApiKey, apiKey.value.trim())
  uni.showToast({
    title: 'API Key 已保存',
    icon: 'none'
  })
}

function exportBackup() {
  const json = buildBackupJson()
  // #ifdef H5
  try {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complement-backup-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    uni.showToast({ title: '备份已下载', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: json,
    success: () => {
      uni.showToast({ title: '备份已复制，请粘贴保存为 .json 文件', icon: 'none' })
    }
  })
  // #endif
}

function importBackup() {
  // #ifdef H5
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json,.json'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      doImport(String(reader.result || ''))
    }
    reader.readAsText(file)
  }
  input.click()
  // #endif
  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success: (res) => {
      const file = res.tempFiles && res.tempFiles[0]
      if (!file) return
      uni.getFileSystemManager().readFile({
        filePath: file.path,
        encoding: 'utf-8',
        success: (r: { data: string | ArrayBuffer }) => {
          doImport(String(r.data || ''))
        },
        fail: () => {
          uni.showToast({ title: '读取文件失败', icon: 'none' })
        }
      })
    }
  })
  // #endif
}

function doImport(jsonText: string) {
  if (!jsonText) {
    uni.showToast({ title: '导入内容为空', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认导入',
    content: '导入将覆盖当前全部数据（人格、测评、记忆与对话），确定继续吗？',
    confirmText: '覆盖导入',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm) return
      const result = importBackupJson(jsonText)
      if (result.ok) {
        uni.showToast({ title: '导入成功', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 800)
      } else {
        uni.showToast({ title: result.msg, icon: 'none' })
      }
    }
  })
}

function clearConversations() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空全部会话对话记录吗？人格、测评与记忆数据会保留。',
    success: (res) => {
      if (res.confirm) {
        const count = clearAllConversations()
        uni.showToast({
          title: count > 0 ? `已清空 ${count} 项对话数据` : '暂无对话数据',
          icon: 'none'
        })
      }
    }
  })
}

function clearData() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有数据吗？包括MBTI与大五测评结果、人格设置和对话记录。',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.reLaunch({
          url: '/pages/index/index'
        })
        uni.showToast({
          title: '数据已清除',
          icon: 'success'
        })
      }
    }
  })
}

function goToMbti() {
  if (!personaStore.isTestCompleted) {
    uni.navigateTo({ url: '/pages/mbti-test/index' })
    return
  }
  uni.showModal({
    title: '重新测试MBTI',
    content: '将清空当前 MBTI 测评结果与答案，已创建的人格不受影响。确定继续吗？',
    confirmText: '重新测试',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm) return
      personaStore.resetMbtiTest()
      uni.navigateTo({ url: '/pages/mbti-test/index' })
    }
  })
}

function goToBigFive() {
  if (!personaStore.isBigFiveTestCompleted) {
    uni.navigateTo({ url: '/pages/mbti-test/index?mode=bigfive' })
    return
  }
  uni.showModal({
    title: '重新测试大五人格',
    content: '将清空当前大五测评结果与答案，已创建的人格不受影响。确定继续吗？',
    confirmText: '重新测试',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm) return
      personaStore.resetBigFiveTest()
      uni.navigateTo({ url: '/pages/mbti-test/index?mode=bigfive' })
    }
  })
}

function goToPersona() {
  uni.navigateTo({
    url: '/pages/persona-list/index'
  })
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: var(--dopamine-bg);
  padding: 32rpx;
}

.header {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--dopamine-text);
}

.settings-group {
  background: var(--dopamine-card);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.group-title {
  display: block;
  font-size: 28rpx;
  color: var(--dopamine-text-sub);
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid var(--dopamine-bg);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.column {
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
}

.setting-hint {
  display: block;
  font-size: 24rpx;
  color: var(--dopamine-text-sub);
  line-height: 1.5;
  padding: 8rpx 0 16rpx;
}

.setting-input {
  width: 100%;
  height: 72rpx;
  background: var(--dopamine-bg);
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.model-picker {
  display: flex;
  align-items: center;
  height: 72rpx;
  line-height: 72rpx;
  color: var(--dopamine-text);
}

.setting-label {
  font-size: 32rpx;
  color: var(--dopamine-text);
}

.setting-value {
  font-size: 32rpx;
  color: var(--dopamine-text-sub);
}

.danger {
  color: var(--dopamine-danger);
}

.setting-arrow {
  font-size: 32rpx;
  color: var(--dopamine-text-sub);
}

.footer {
  text-align: center;
  padding: 100rpx 0;
}

.footer-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--dopamine-primary);
  margin-bottom: 8rpx;
}

.footer-subtext {
  display: block;
  font-size: 24rpx;
  color: var(--dopamine-text-sub);
}
</style>
