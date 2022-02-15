const axios = require('axios')
const { orgsName } = require('./constants')

axios.interceptors.response.use(res => res.data)

async function fetchRepoList() {
  // 这里可以不写死, 通过配置文件 kai config ,拉取不同的仓库
  return axios.get(`https://api.github.com/orgs/${orgsName}/repos`)
}

async function fetchTagList(repo) {
  return axios.get(`https://api.github.com/repos/${orgsName}/${repo}/tags`)
}

module.exports = {
  fetchRepoList,
  fetchTagList,
}