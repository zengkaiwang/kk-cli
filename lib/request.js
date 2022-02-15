const axios = require('axios')

axios.interceptors.response.use(res => res.data)

async function fetchRepoList() {
  // 这里可以不写死, 通过配置文件 kai config ,拉取不同的仓库
  const name = 'zhu-cli'
  return axios.get(`https://api.github.com/orgs/${name}/repos`)
}

module.exports = {
  fetchRepoList,
}