export const STORAGE_KEYS = {
  aiModels: 'ai_models',
  cloudGatewayUrl: 'cloud_gateway_url',
  cloudGatewayToken: 'cloud_gateway_token',
  useCloudProxy: 'use_cloud_proxy',
}

// H5 端统一读写辅助：ai_models 为 JSON 数组，use_cloud_proxy 为布尔
export function readStorage<T = unknown>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return undefined
    if (key === STORAGE_KEYS.aiModels) return JSON.parse(raw) as T
    if (key === STORAGE_KEYS.useCloudProxy) return (raw === 'false' ? false : true) as T
    return raw as T
  } catch (e) {
    return undefined
  }
}

export function writeStorage(key: string, value: unknown) {
  const raw =
    typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number'
      ? String(value)
      : JSON.stringify(value)
  localStorage.setItem(key, raw)
}