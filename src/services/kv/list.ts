type KVList = string[]

export const list = kv =>
  (key?: string): Promise<KVList> =>
    kv
      .list({ prefix: key })
      .then(({ keys }) => keys)
