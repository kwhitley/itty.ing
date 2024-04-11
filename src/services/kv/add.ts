import { CacheRecord } from './'
import { DEFAULT_CACHE_DURATION } from '.'

export const add = kv => (
  key: string,
  record: CacheRecord,
  ttl?: number,
) =>
  kv.put(
    key,
    record.value,
    {
      metadata: {
        type: record.type,
        filename: record.filename,
        expires: record.expires.toISOString(),
      },
      expirationTtl: ttl || DEFAULT_CACHE_DURATION,
    },
  )
