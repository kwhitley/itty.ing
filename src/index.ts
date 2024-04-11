import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types'
import { AutoRouter, IRequest } from 'itty-router'
import { datePlus, getSeconds } from 'itty-time'
import { getKV } from './services/kv'

const CACHE_DURATION = '1 month'

const router = AutoRouter<IRequest, [{ KV: KVNamespace }, ExecutionContext]>()

router
  .get('/:origin+', async ({
    url,
    origin,
  }, { KV }, context) => {
    const realOrigin = url.substring(url.indexOf(origin))
    const kv = getKV(KV)

    // start fetching from origin immediately
    const originFetch = fetch(realOrigin)

    // start saving the request, if good
    const saveGoodRequest = originFetch
      .then(async r => {
        if (!r.ok) throw Error('ignore')
        const value = await r.clone().arrayBuffer()

        const newEntry = {
          value,
          type: r.headers.get('content-type'),
          expires: datePlus('1 month'),
        }

        // console.log('writing entry', newEntry, 'to KV @', realOrigin)

        return kv.add(realOrigin, {
          value,
          type: r.headers.get('content-type'),
          expires: datePlus(CACHE_DURATION),
        }, getSeconds(CACHE_DURATION))
      })
      .catch()

    // make sure this happens after resolution
    context.waitUntil(saveGoodRequest)

    // then await KV result for early exit
    const fromKV = await kv.get(realOrigin)

    if (!fromKV) return originFetch

    return new Response(fromKV.value, {
      // @ts-ignore
      headers: {
        'content-type': fromKV.type,
      }
    })
  })

export default { ...router }
