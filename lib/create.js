// 创建项目
const path = require('path')
const fs = require('fs-extra')
const Inquirer = require('inquirer')
module.exports = async function(projectName, options) {
  // console.log(projectName, options)
  const cwd = process.cwd() // 获取当前命令执行时的工作目录
  const targeDir = path.join(cwd, projectName) // 目标目录
  
  if(fs.existsSync(targeDir)) {
    if(options.force) { // 目录已存在, 强制创建时删除已有的
      await fs.remove(targeDir)
    }else {
      // 提示用户是否要覆盖
      const {action} = await Inquirer.prompt([ // 配置询问方式
        {
          name: 'action',
          type: 'list', // 类型有很多
          message: 'Target directory already exist. Pick an action.',
          choices: [
            {name: 'Overwrite', value: 'overwrite'},
            {name: 'Cancel', value: false}
          ]
        }
      ])
      console.log(action)
      if(!action) {
        return
      } else if(action === 'overwrite') {
        await fs.remove(targeDir)
      }
    }
  }
}