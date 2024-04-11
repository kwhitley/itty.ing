import { getSeconds } from 'itty-time'
import { CacheRecord } from './index'

const EDGE_CACHE_PERIOD = getSeconds('60 seconds')

export const get = kv =>
  (key: string): Promise<CacheRecord | undefined> =>
    kv
      .getWithMetadata(key, { type: 'arrayBuffer', cacheTtl: EDGE_CACHE_PERIOD })
      .then(entry => {
        if (!entry?.value) return undefined

        return {
          value: entry.value,
          type: entry.metadata?.type,
          filename: entry.metadata?.filename,
          size: entry.value.byteLength,
          expires: new Date(entry.metadata?.expires),
        }
      })
