import crypto from 'crypto'

function encryptMd5(value) {
  return crypto
    .createHash('md5')
    .update(value)
    .digest('hex')
}

export async function encryptWithMd5(item) {
  let [, , properties] = item

  Object.keys(properties || {}).forEach(
    prop => (item[2][prop] = encryptMd5(properties[prop]))
  )

  return item
}

export async function encryptBatchWithMd5(batch) {
  return await Promise.all(batch.map(encryptWithMd5))
}
