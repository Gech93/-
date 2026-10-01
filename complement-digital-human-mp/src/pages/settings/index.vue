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
        <text class="setting-label">使用云端网关</text>
        <switch :checked="useCloudProxy" @change="toggleCloudProxy" color="#667eea" />
      </view>
      <view class="setting-hint">开启后，AI 请求将经你的 uniCloud 云函数转发，API Key 不再暴露在客户端</view>

      <view class="setting-item column">
        <text class="setting-label">网关地址</text>
        <input
          v-model="gatewayUrl"
          class="setting-input"
          placeholder="https://xxx.next.bspapp.com/chat-gateway"
          @blur="saveGatewayUrl"
        />
        <text class="setting-hint">在 uniCloud 控制台部署 chat-gateway 云函数并配置环境变量 DEEPSEEK_API_KEY，然后把云函数 URL 粘贴到这里</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">功能</text>
      
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
import manifest from '../../manifest.json'

const personaStore = usePersonaStore()

const appVersion = `v${manifest.versionName || '1.0.0'}`

const useCloudProxy = ref(uni.getStorageSync('use_cloud_proxy') === true)
const gatewayUrl = ref(uni.getStorageSync('cloud_gateway_url') || '')

function toggleCloudProxy(e: Event) {
  const detail = (e as unknown as { detail?: { value?: boolean } }).detail
  useCloudProxy.value = detail?.value ?? !useCloudProxy.value
  uni.setStorageSync('use_cloud_proxy', useCloudProxy.value)
  uni.showToast({
    title: useCloudProxy.value ? '已启用云端网关' : '已关闭云端网关',
    icon: 'none'
  })
}

function saveGatewayUrl() {
  uni.setStorageSync('cloud_gateway_url', gatewayUrl.value.trim())
  uni.showToast({
    title: '网关地址已保存',
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
  uni.navigateTo({
    url: '/pages/mbti-test/index'
  })
}

function goToBigFive() {
  uni.navigateTo({
    url: '/pages/mbti-test/index?mode=bigfive'
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
  background: #f5f5f5;
  padding: 32rpx;
}

.header {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.settings-group {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.group-title {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 32rpx;
  color: #333333;
}

.setting-value {
  font-size: 32rpx;
  color: #999999;
}

.danger {
  color: #e64340;
}

.setting-arrow {
  font-size: 32rpx;
  color: #999999;
}

.footer {
  text-align: center;
  padding: 100rpx 0;
}

.footer-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.footer-subtext {
  display: block;
  font-size: 24rpx;
  color: #999999;
}
</style>
