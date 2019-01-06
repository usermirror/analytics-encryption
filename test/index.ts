import test from 'ava'
import analyticsEncryption from '../src'
import { encryptBatchWithMd5 } from './_utils'

test('passthrough', t => {
  let analytics = analyticsEncryption()

  analytics.track('Test')

  t.is(analytics.original.queue.length, 1)
})

test('basic hash with await', async t => {
  let analytics = analyticsEncryption({
    local: { encrypt: encryptBatchWithMd5 }
  })

  await analytics.track('Test', { prop1: 'abc' })

  t.is(analytics.original.queue.length, 1)

  let [, , properties] = analytics.original.queue[0] as any

  t.true(properties['prop1'] !== 'abc')
})

test('basic hash with setTimeout', t => {
  let analytics = analyticsEncryption({
    local: { encrypt: encryptBatchWithMd5 }
  })

  analytics.track('Test', { prop1: 'abc' })

  return new Promise(resolve => {
    setTimeout(() => {
      t.is(analytics.original.queue.length, 1)

      let [, , properties] = analytics.original.queue[0] as any

      t.true(properties['prop1'] !== 'abc')

      resolve()
    }, 0)
  })
})
