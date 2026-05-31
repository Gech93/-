<template>
  <view class="settings-container">
    <view class="header">
      <text class="page-title">设置</text>
    </view>

    <view class="settings-group">
      <text class="group-title">关于</text>
      
      <view class="setting-item">
        <text class="setting-label">版本</text>
        <text class="setting-value">v1.0.0</text>
      </view>
      
      <view class="setting-item">
        <text class="setting-label">类型</text>
        <text class="setting-value">微信小程序版</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">数据管理</text>
      
      <view class="setting-item" @click="clearData">
        <text class="setting-label">清除所有数据</text>
        <text class="setting-arrow">→</text>
      </view>
    </view>

    <view class="settings-group">
      <text class="group-title">功能</text>
      
      <view class="setting-item" @click="goToMbti">
        <text class="setting-label">重新测试MBTI</text>
        <text class="setting-arrow">→</text>
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
import { usePersonaStore } from '../../stores/persona'

const personaStore = usePersonaStore()

function clearData() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有数据吗？包括MBTI测试结果、人格设置和对话记录。',
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
