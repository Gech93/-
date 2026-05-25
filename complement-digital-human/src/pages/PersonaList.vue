<template>
  <div class="persona-container">
    <div class="header">
      <h1 class="page-title">我的数字人</h1>
    </div>

    <div class="tips-section" v-if="!personaStore.isTestCompleted">
      <span>完成MBTI测试，创建你的互补数字人</span>
      <button class="tips-btn" @click="goToTest">去测试</button>
    </div>

    <div class="mbti-card" v-if="personaStore.userMbti">
      <div class="mbti-header">
        <div class="mbti-icon">🧠</div>
        <div class="mbti-info">
          <span class="mbti-label">你的MBTI</span>
          <span class="mbti-type">{{ personaStore.userMbti }}</span>
        </div>
        <button class="retest-btn" @click="handleRetest">重新测试</button>
      </div>
    </div>

    <div class="persona-list">
      <div class="section-header">
        <span class="section-title">人格列表</span>
        <span class="persona-count">{{ personaStore.personaCount }} / 5</span>
      </div>

      <div
        v-for="persona in personaStore.personas"
        :key="persona.id"
        class="persona-card"
        :class="{ active: persona.isActive }"
        @click="handleSelect(persona)"
      >
        <div class="persona-header">
          <div class="persona-avatar">
            <span>{{ persona.complementMbti }}</span>
          </div>
          <div class="persona-info">
            <span class="persona-name">{{ persona.name }}</span>
            <span class="persona-mbti">互补类型：{{ persona.complementMbti }}</span>
          </div>
          <div class="persona-badge" v-if="persona.isActive">
            使用中
          </div>
        </div>

        <div class="persona-stats">
          <div class="stat-item">
            <span class="stat-value">{{ persona.complementLevel }}%</span>
            <span class="stat-label">互补度</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ persona.totalConversations }}</span>
            <span class="stat-label">对话次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">Lv.{{ persona.growthLevel }}</span>
            <span class="stat-label">成长等级</span>
          </div>
        </div>

        <div class="persona-actions">
          <button class="action-btn" @click.stop="handleChat(persona)">开始对话</button>
          <button class="action-btn secondary" @click.stop="handleDelete(persona)">删除</button>
        </div>
      </div>

      <div class="empty-state" v-if="personaStore.personas.length === 0 && personaStore.isTestCompleted">
        <span class="empty-icon">🤖</span>
        <span class="empty-text">还没有创建数字人</span>
        <span class="empty-hint">创建一个与你互补的数字人伴侣</span>
      </div>
    </div>

    <div class="create-section" v-if="personaStore.canCreateMore && personaStore.isTestCompleted">
      <button class="create-btn" @click="goToCreate">
        <span>+</span>
        <span>创建新人格</span>
      </button>
    </div>

    <div class="info-tip" v-if="personaStore.personaCount > 0">
      <span>💡 最多可创建5个人格，适用于不同场景</span>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const personaStore = usePersonaStore()

function goToTest() {
  router.push('/mbti')
}

function goToCreate() {
  router.push('/persona/create')
}

function handleSelect(persona: any) {
  personaStore.switchPersona(persona.id)
}

function handleChat(persona: any) {
  personaStore.switchPersona(persona.id)
  router.push('/chat/conversation')
}

function handleDelete(persona: any) {
  if (confirm(`确定要删除"${persona.name}"吗？`)) {
    personaStore.deletePersona(persona.id)
  }
}

function handleRetest() {
  if (confirm('重新测试会影响人格数据，确定要继续吗？')) {
    personaStore.resetTest()
    router.push('/mbti')
  }
}
</script>

<style scoped>
.persona-container {
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

.tips-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  margin-bottom: 20px;
}

.tips-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 16px;
}

.mbti-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.mbti-header {
  display: flex;
  align-items: center;
}

.mbti-icon {
  width: 64px;
  height: 64px;
  background: #667eea;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 16px;
}

.mbti-info {
  flex: 1;
}

.mbti-label {
  display: block;
  font-size: 14px;
  color: #999999;
  margin-bottom: 4px;
}

.mbti-type {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #333333;
}

.retest-btn {
  background: #f5f5f5;
  color: #667eea;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 16px;
}

.persona-list {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
}

.persona-count {
  font-size: 14px;
  color: #999999;
}

.persona-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.persona-card.active {
  border-color: #667eea;
}

.persona-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.persona-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}

.persona-info {
  flex: 1;
}

.persona-name {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 6px;
}

.persona-mbti {
  display: block;
  font-size: 14px;
  color: #999999;
}

.persona-badge {
  background: #667eea;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.persona-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 6px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999999;
}

.persona-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  flex: 1;
  height: 48px;
  background: #667eea;
  color: #ffffff;
  font-size: 16px;
  border-radius: 24px;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #666666;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  display: block;
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  display: block;
  font-size: 20px;
  color: #333333;
  margin-bottom: 12px;
}

.empty-hint {
  display: block;
  font-size: 16px;
  color: #999999;
}

.create-section {
  margin-bottom: 20px;
}

.create-btn {
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.create-btn span:first-child {
  font-size: 28px;
}

.info-tip {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #999999;
}
</style>
