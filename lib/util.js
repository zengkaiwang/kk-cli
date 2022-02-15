const ora = require('ora')

async function sleep(time) {
  return new Promise((resolve, reject) => setTimeout(resolve, time))
}

// 制作一个等待loading效果
async function wrapLoading(fn, msg) {
  const loading = ora(msg)
  loading.start() // 开始加载
  try {
    let data = await fn()
    loading.succeed() // 加载成功
    return data
  } catch (e) {
    console.log(e)
    loading.fail('request fail, refetch...')
    // 失败重新拉取: 拉取失败后 睡觉1s 然后继续拉取
    await sleep(1000)
    return wrapLoading(fn, msg)
  }
}

module.exports = {
  wrapLoading,
}