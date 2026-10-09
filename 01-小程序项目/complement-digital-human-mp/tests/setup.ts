import { beforeEach, vi } from 'vitest'

const storage = new Map<string, unknown>()

beforeEach(() => {
  storage.clear()
})

vi.stubGlobal('uni', {
  getStorageSync: (key: string) => (storage.has(key) ? storage.get(key) : ''),
  setStorageSync: (key: string, value: unknown) => {
    storage.set(key, value)
  },
  removeStorageSync: (key: string) => {
    storage.delete(key)
  },
  getStorageInfoSync: () => ({ keys: Array.from(storage.keys()) }),
  showToast: vi.fn(),
})