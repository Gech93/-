<template>
  <view class="conversation-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-left" @click="goBack">
        <text>←</text>
      </view>
      <view class="nav-center" @click="showModeInfo">
        <text class="persona-name">{{ personaStore.activePersona?.name || '数字人' }}</text>
        <text class="persona-mode">{{ isDecisionMode ? '决策模式' : '普通模式' }}</text>
      </view>
      <view class="nav-right" @click="showSettings">
        <text>⋮</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-into-view="scrollIntoView"
    >
      <!-- 欢迎消息 -->
      <view class="welcome-message" v-if="messages.length === 0">
        <view class="welcome-avatar">
          <text>{{ personaStore.activePersona?.complementMbti || 'AI' }}</text>
        </view>
        <text class="welcome-text">
          你好！我是{{ personaStore.activePersona?.name || '你的数字人' }}，一个与你互补的AI伙伴。
          有什么想聊的，或者需要我做决策参考吗？
        </text>
      </view>

      <!-- 消息 -->
      <view
        v-for="msg in messages"
        :key="msg.id"
        :id="'msg-' + msg.id"
        class="message-item"
        :class="msg.role"
      >
        <view class="message-avatar" v-if="msg.role === 'assistant'">
          <text>{{ personaStore.activePersona?.complementMbti || 'AI' }}</text>
        </view>
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ formatTime(msg.timestamp) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 决策模式说明弹窗 -->
    <view class="mode-info-modal" v-if="showDecisionInfo" @click="showDecisionInfo = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">🎯 决策模式说明</text>
        <view class="modal-section">
          <text class="section-title">目的</text>
          <text class="section-text">帮助分析重要决策，提供多角度视角</text>
        </view>
        <view class="modal-section">
          <text class="section-title">特点</text>
          <text class="section-text">• 更结构化的分析框架\n• 会主动提问关键问题\n• 明确区分你的倾向和互补视角</text>
        </view>
        <view class="modal-section">
          <text class="section-title">适用场景</text>
          <text class="section-text">• 职业选择和发展规划\n• 人生重大决定\n• 重要人际关系问题</text>
        </view>
        <view class="modal-section">
          <text class="section-title disclaimer">⚠️ 免责声明</text>
          <text class="section-text">最终决策权在您，我们提供视角而非答案</text>
        </view>
        <button class="modal-close" @click="showDecisionInfo = false">我知道了</button>
      </view>
    </view>

    <!-- 底部输入区 -->
    <view class="input-section">
      <!-- 模式切换 -->
      <view class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: !isDecisionMode }"
          @click="isDecisionMode = false"
        >
          💬 普通
        </button>
        <button
          class="mode-btn decision"
          :class="{ active: isDecisionMode }"
          @click="toggleDecisionMode"
        >
          🎯 决策{{ showDecisionInfo ? '?' : '' }}
        </button>
      </view>

      <!-- 互补度调节 -->
      <view class="complement-slider">
        <text class="slider-label">互补度</text>
        <slider
          :value="personaStore.activePersona?.complementLevel || 50"
          :min="0"
          :max="100"
          :step="10"
          activeColor="#667eea"
          block-size="20"
          @change="handleComplementChange"
        />
        <text class="slider-value">{{ personaStore.activePersona?.complementLevel || 50 }}%</text>
      </view>

      <!-- 输入框 -->
      <view class="input-row">
        <input
          v-model="inputText"
          class="message-input"
          placeholder="输入你的想法..."
          confirm-type="send"
          @confirm="sendMessage"
        />
        <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
          <text>发送</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePersonaStore } from '@/stores/persona'
import { useConversation, type Message } from '@/stores/conversation'

const personaStore = usePersonaStore()
const conversation = useConversation()

const messages = ref<Message[]>([])
const inputText = ref('')
const isDecisionMode = ref(false)
const showDecisionInfo = ref(false)
const scrollTop = ref(0)
const scrollIntoView = ref('')

onLoad((options: any) => {
  if (options.conversationId) {
    messages.value = conversation.getConversation(options.conversationId)
  }
})

function formatTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function toggleDecisionMode() {
  if (!isDecisionMode.value) {
    showDecisionInfo.value = true
  }
  isDecisionMode.value = !isDecisionMode.value
}

function showModeInfo() {
  showDecisionInfo.value = true
}

function showSettings() {
  uni.showActionSheet({
    itemList: ['清空对话', '查看人格详情', '调节互补度'],
    success: (res) => {
      if (res.tapIndex === 0) {
        messages.value = []
        conversation.clearConversation('current')
      }
    },
  })
}

async function sendMessage() {
  if (!inputText.value.trim()) return

  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText.value,
    timestamp: new Date(),
    isDecisionMode: isDecisionMode.value,
  }

  messages.value.push(userMsg)
  const text = inputText.value
  inputText.value = ''

  scrollToBottom()

  // 模拟AI回复
  const aiMsg = await conversation.sendMessage(text, isDecisionMode.value)
  messages.value.push(aiMsg)

  scrollToBottom()
}

function scrollToBottom() {
  setTimeout(() => {
    scrollIntoView.value = 'msg-' + (messages.value[messages.value.length - 1]?.id || '')
  }, 100)
}

function handleComplementChange(e: any) {
  const level = e.detail.value
  const canModify = personaStore.canModifyComplement(personaStore.activePersona!)

  if (!canModify) {
    const remainDays = personaStore.getRemainDays(personaStore.activePersona!)
    uni.showToast({
      title: `每月限修改1次，还剩${remainDays}天`,
      icon: 'none',
    })
    return
  }

  personaStore.updateComplementLevel(level)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.conversation-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-header {
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  color: #ffffff;
}

.nav-left {
  font-size: 40rpx;
  padding: 10rpx;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.persona-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
}

.persona-mode {
  display: block;
  font-size: 22rpx;
  opacity: 0.8;
}

.nav-right {
  font-size: 40rpx;
  padding: 10rpx;
}

.message-list {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.welcome-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 28rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.welcome-text {
  flex: 1;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  background: #ffffff;
  padding: 24rpx;
  border-radius: 20rpx;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
  
  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      .message-text {
        color: #ffffff;
      }
      
      .message-time {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.message-avatar {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  
  text {
    font-size: 24rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.message-content {
  max-width: 70%;
  background: #ffffff;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
}

.message-text {
  display: block;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  display: block;
  font-size: 20rpx;
  color: #999999;
  margin-top: 10rpx;
  text-align: right;
}

.mode-info-modal {
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
  width: 600rpx;
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

.modal-section {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
  
  &.disclaimer {
    color: #ff9500;
  }
}

.section-text {
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

.input-section {
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.mode-toggle {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.mode-btn {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  color: #666666;
  font-size: 26rpx;
  border-radius: 36rpx;
  border: none;
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
  
  &.decision.active {
    background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
  }
}

.complement-slider {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.slider-label {
  font-size: 24rpx;
  color: #999999;
  margin-right: 16rpx;
}

.slider-value {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
  margin-left: 16rpx;
  min-width: 80rpx;
}

.input-row {
  display: flex;
  gap: 20rpx;
}

.message-input {
  flex: 1;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 44rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 140rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  
  &:disabled {
    background: #e0e0e0;
    color: #999999;
  }
}
</style>
