const { fetchRepoList } = require("./request")
const Inquirer = require('inquirer')
const { wrapLoading } = require("./util")
class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName
    this.target = targetDir
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
  async fetchTag() {

  }
  async download() {

  }
  
  async create() {
    // console.log(this.name, this.target)
    // 1) 先从github上拉取项目模板 ps: github 是提供api
    let repo = await this.fetchRepo()
    console.log(repo)

    // 2) 再通过项目模板找到其版本号
    let tag = await this.fetchTag()

    // 3) 下载到本地
    let downloadUrl = await this.download(repo, tag)
    
    // 4) 根据用户选择 编译模板
  }
}

module.exports = Creator