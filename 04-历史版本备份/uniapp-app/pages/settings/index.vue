<template>
  <view class="settings-container">
    <!-- 隐私设置 -->
    <view class="settings-section">
      <text class="section-title">隐私与数据</text>
      
      <view class="setting-item" @click="goToPrivacy">
        <view class="setting-left">
          <text class="setting-icon">🔒</text>
          <view class="setting-info">
            <text class="setting-name">隐私设置</text>
            <text class="setting-desc">管理你的数据存储方式</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>

      <view class="setting-item" @click="handleExport">
        <view class="setting-left">
          <text class="setting-icon">📤</text>
          <view class="setting-info">
            <text class="setting-name">导出数据</text>
            <text class="setting-desc">下载你的所有数据</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="settings-section">
      <text class="section-title">关于</text>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-icon">ℹ️</text>
          <view class="setting-info">
            <text class="setting-name">版本信息</text>
            <text class="setting-desc">v1.0.0 模拟AI版本</text>
          </view>
        </view>
      </view>

      <view class="setting-item" @click="showAbout">
        <view class="setting-left">
          <text class="setting-icon">🤖</text>
          <view class="setting-info">
            <text class="setting-name">关于互补数字人</text>
            <text class="setting-desc">了解产品理念和功能</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 账户 -->
    <view class="settings-section">
      <text class="section-title">账户</text>
      
      <view class="setting-item danger" @click="handleClearData">
        <view class="setting-left">
          <text class="setting-icon">🗑️</text>
          <view class="setting-info">
            <text class="setting-name">清除所有数据</text>
            <text class="setting-desc">删除账户和所有历史数据</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 产品介绍 -->
    <view class="about-card">
      <view class="about-icon">🤖</view>
      <text class="about-title">互补数字人</text>
      <text class="about-desc">
        一个与你人格互补的AI伙伴，帮助你在决策时获得不同视角的参考。
        支持多个人格档案，满足不同场景需求。
      </text>
      <view class="about-features">
        <text class="feature-tag">🧠 MBTI人格测试</text>
        <text class="feature-tag">💬 AI对话</text>
        <text class="feature-tag">🎯 决策辅助</text>
        <text class="feature-tag">📈 持续成长</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer-info">
      <text>© 2025 互补数字人</text>
      <text>用AI发现另一个视角</text>
    </view>

    <!-- 关于弹窗 -->
    <view class="about-modal" v-if="showAboutModal" @click="showAboutModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">关于互补数字人</text>
        
        <view class="about-section">
          <text class="about-section-title">💡 产品理念</text>
          <text class="about-section-text">
            每个人都有自己的思维盲区，而这个数字人能帮助你从另一个视角看待问题。
            它不是要取代你的思考，而是补充和拓展你的视野。
          </text>
        </view>

        <view class="about-section">
          <text class="about-section-title">🎯 核心功能</text>
          <text class="about-section-text">
            • MBTI人格测试：发现你的性格特点\n
            • 互补人格：生成与你互补的AI人格\n
            • 决策辅助：在重要决策时提供不同视角\n
            • 持续成长：随着使用不断学习和进化
          </text>
        </view>

        <view class="about-section">
          <text class="about-section-title">🔒 隐私保护</text>
          <text class="about-section-text">
            你的数据由你掌控。我们提供本地存储、云端加密等多种存储方式，
            所有数据处理都遵循严格的隐私保护原则。
          </text>
        </view>

        <button class="modal-close" @click="showAboutModal = false">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { usePersonaStore } from '@/stores/persona'

const settingsStore = useSettingsStore()
const personaStore = usePersonaStore()

const showAboutModal = ref(false)

function goToPrivacy() {
  uni.navigateTo({
    url: '/pages/settings/privacy',
  })
}

function handleExport() {
  uni.showModal({
    title: '导出数据',
    content: '确定要导出所有数据吗？',
    success: (res) => {
      if (res.confirm) {
        const data = settingsStore.exportData()
        uni.showToast({
          title: '数据已导出',
          icon: 'success',
        })
      }
    },
  })
}

function handleClearData() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有数据吗？此操作不可恢复！',
    success: (res) => {
      if (res.confirm) {
        settingsStore.clearAllData()
        personaStore.loadFromStorage()
        uni.reLaunch({
          url: '/pages/index/index',
        })
      }
    },
  })
}

function showAbout() {
  showAboutModal.value = true
}

onShow(() => {
  settingsStore.loadFromStorage()
})
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 120rpx;
}

.settings-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 10rpx 0;
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 24rpx;
  color: #999999;
  padding: 20rpx 30rpx;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  &.danger {
    .setting-icon {
      background: rgba(255, 59, 48, 0.1);
    }
    
    .setting-name {
      color: #ff3b30;
    }
  }
}

.setting-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.setting-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 36rpx;
  }
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 6rpx;
}

.setting-desc {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.setting-arrow {
  font-size: 40rpx;
  color: #cccccc;
  margin-left: 20rpx;
}

.about-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  margin-top: 40rpx;
}

.about-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.about-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.about-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.footer-info {
  text-align: center;
  padding: 40rpx 0;
  
  text {
    display: block;
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 8rpx;
  }
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
  width: 650rpx;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 40rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 30rpx;
}

.about-section {
  margin-bottom: 24rpx;
}

.about-section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 12rpx;
}

.about-section-text {
  display: block;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-close {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  margin-top: 30rpx;
}
</style>
