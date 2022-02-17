const { fetchRepoList, fetchTagList } = require("./request")
const Inquirer = require('inquirer')
const { wrapLoading } = require("./util")
const downloadGitRepo = require('download-git-repo')
const util = require('util')
const path = require('path')
const fs = require('fs')
const ncp= require('ncp')
const { orgsName, temDownloadDirectory } = require('./constants')
const Metalsmith = require('metalsmith') // 这个包用来 遍历文件夹 找文件需不需要渲染

// consolidate 统一了所有的模板引擎库, 该库配合模板引擎库使用, ejs handlebars都是模板引擎库
// const { render } = require('consolidate').handlebars
const { render } = require('consolidate').ejs
class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName
    this.target = targetDir
    // downloadGitRepo这个函数默认不是promise ,使用node的util模块 转成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo)
    this.ncp = util.promisify(ncp)
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
    // /user/xxxx/.template/repo
    const dest = `${temDownloadDirectory}/${repo}`
    await wrapLoading(this.downloadGitRepo, 'waiting download...', requestUrl, dest)

    return dest // 下载的临时目录
  }
  
  async create() {
    // console.log(this.name, this.target)
    // 1) 先从github上拉取项目模板 ps: github 是提供api
    let repo = await this.fetchRepo()

    // 2) 再通过项目模板找到其版本号
    let tag = await this.fetchTag(repo)
    // console.log(repo, tag)

    // 3) 下载模板-把模板放到一个临时目录里
    let result = await this.download(repo, tag)
    console.log(result)
    
    // 4) 根据用户选择的模板, 这里有两种情况: 1.无需编译的简单模板 2.需要编译的模板
    // 通过下边在模板项目中是否有ask.js 文件 来判断是不是需要编译
    if(!fs.existsSync(path.join(result, 'ask.json'))) {
      // 4-1) 情况1-简单模板: 直接拷贝当前执行的目录下即可
      await this.ncp(result, path.resolve(this.name))
    } else {
      // 4-1) 情况2-需要编译的模板: 需要模板渲染 渲染后在拷贝
      // 把git上的项目下载下来，如果有ask 文件就是一个复杂的模板,我们需要用户选择，选择后编译模板
      await new Promise((resolve, reject) => {
        Metalsmith(__dirname) // __dirname当前目录 其实可以不传, 会被source传入的目录替换
          .source(result)
          .destination(path.resolve(this.name)) // 目的地 这里内部完成拷贝动作
          .use(async (files, metal, done) => { 
            // files 是传入目录下的所有文件
            // console.log(files)
            // 1) 让用户填信息
            const args = require(path.join(result, 'ask.json'))
            const infoObj = await Inquirer.prompt(args)
            Object.assign(metal.metadata(), infoObj)
            delete files['ask.json']
            done()
          })
          .use((files, metal, done) => {
            // Metalsmith 用法很像koa 可以很多次.use()使用中间件
            // 2) 用用户填写的信息去渲染模板
            const obj = metal.metadata()
            // Reflect.ownKey === Object.ownKey
            Reflect.ownKeys(files).forEach(async (file) => {
              if(file.includes('.js') || file.includes('.json')) {
                // 读取到的文件内容contents是Buffer对象
                let contents = files[file].contents.toString()
                if(contents.includes('<%')) {
                  // 使用模板引擎渲染
                  contents = await render(contents, obj)
                  files[file].contents = Buffer.from(contents)
                }
              }
            })
            done()
          })
          .build((err) => { // 执行build 才会执行, 上边的.use啥的都算是配置
            if(err) {
              reject(err)
            } else {
              resolve()
            }
          })
      })
      
    }

  }
}

module.exports = Creator