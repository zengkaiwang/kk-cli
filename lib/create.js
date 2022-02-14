// 创建项目
const path = require('path')
const fs = require('fs-extra')
module.exports = async function(projectName, options) {
  // console.log(projectName, options)
  const cwd = process.cwd() // 获取当前命令执行时的工作目录
  const targeDir = path.join(cwd, projectName) // 目标目录
  
  if(fs.existsSync(targeDir)) {
    if(options.force) { // 目录已存在, 强制创建时删除已有的
      await fs.remove(targeDir)
    }
  }
}