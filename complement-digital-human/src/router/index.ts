import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../pages/Index.vue')
  },
  {
    path: '/mbti',
    name: 'MbtiTest',
    component: () => import('../pages/MbtiTest.vue')
  },
  {
    path: '/persona',
    name: 'PersonaList',
    component: () => import('../pages/PersonaList.vue')
  },
  {
    path: '/persona/create',
    name: 'PersonaCreate',
    component: () => import('../pages/PersonaCreate.vue')
  },
  {
    path: '/chat',
    name: 'ChatList',
    component: () => import('../pages/ChatList.vue')
  },
  {
    path: '/chat/conversation',
    name: 'ChatConversation',
    component: () => import('../pages/ChatConversation.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue')
  },
  {
    path: '/settings/privacy',
    name: 'PrivacySettings',
    component: () => import('../pages/PrivacySettings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
