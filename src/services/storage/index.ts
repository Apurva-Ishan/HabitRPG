import { LocalStorageAdapter } from './LocalStorageAdapter'
import type { StorageAdapter } from './StorageAdapter'

// Single shared instance — swap this for a different adapter later
// (e.g. IndexedDBAdapter, BackendAdapter) without touching any other file
export const storage: StorageAdapter = new LocalStorageAdapter()