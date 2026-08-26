import type { StorageAdapter } from './StorageAdapter'

export class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      console.warn(`[Storage] Failed to read key "${key}"`)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(`[Storage] Failed to write key "${key}"`, e)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      console.warn(`[Storage] Failed to remove key "${key}"`)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch {
      console.warn('[Storage] Failed to clear storage')
    }
  }

  keys(): string[] {
    try {
      return Object.keys(localStorage)
    } catch {
      return []
    }
  }
}