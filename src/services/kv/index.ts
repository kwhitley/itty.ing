import { getSeconds } from 'itty-time'
import { add } from './add'
import { get } from './get'
import { list } from './list'
import { remove } from './remove'
import { KVNamespace } from '@cloudflare/workers-types'

export const DEFAULT_CACHE_DURATION = getSeconds('1 hour')

export type CacheRecord = {
  value: ArrayBuffer,
  type?: string | null,
  expires: Date,
  filename?: string,
  size?: number,
}

export const getKV = (kv: KVNamespace) => ({
  add: add(kv),
  delete: remove(kv),
  get: get(kv),
  list: list(kv),
  remove: remove(kv),
})
