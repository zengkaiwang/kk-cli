const { fetchRepoList, fetchTagList } = require("./request")
const Inquirer = require('inquirer')
const { wrapLoading } = require("./util")
const downloadGitRepo = require('download-git-repo')
const util = require('util')
const path = require('path')
const { orgsName } = require('./constants')
class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName
    this.target = targetDir
    // downloadGitRepo这个函数默认不是promise ,使用node的util模块 转成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }

  async fetchRepo() {
    // let repos = await fetchRepoList()
    let repos = await wrapLoading(fetchRepoList, 'waiting fetch template')
    if(!repos) return
    repos = repos.map(item => item.name)
    const { repo } = await Inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'please choose a template to create project'
    })
    // console.log(repo, 'wzk')
    return repo
  }
  async fetchTag(repo) {
    let tags = await wrapLoading(fetchTagList, 'waiting fetch tags', repo)
    if(!tags) return
    tags = tags.map(item => item.name)
    const { tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'please choose a tag to create project'
    })
    return tag
  }
  async download(repo, tag) {
    // 1. 需要拼接下请求路径, 如scaler-king/vue-template#1.0
    const requestUrl = `${orgsName}/${repo}${tag?'#'+tag:''}`
    // console.log('requestUrl', requestUrl)

    // 2. 把下载的资源放到某个路径上(后续增加缓存功能, 应该先下载到系统目录中, 然后可以使用ejs handlerbar 去渲染模板, 最后生成的结果, 再写入当前目录)
    await wrapLoading(this.downloadGitRepo, 'waiting download...', requestUrl, path.resolve(process.cwd(), `${repo}#${tag}`))
  }
  
  async create() {
    // console.log(this.name, this.target)
    // 1) 先从github上拉取项目模板 ps: github 是提供api
    let repo = await this.fetchRepo()

    // 2) 再通过项目模板找到其版本号
    let tag = await this.fetchTag(repo)
    // console.log(repo, tag)

    // 3) 下载到本地
    let downloadUrl = await this.download(repo, tag)
    
    // 4) 根据用户选择 编译模板
  }
}

module.exports = Creator