// const orgsName = 'scaler-king'
const orgsName = 'zhu-cli'

// 存放项目项目的临时目录: 电脑系统目录, 创建隐藏目录防止用户删除
const temDownloadDirectory = `${process.env[process.platform === 'darwin'? 'HOME':'USERPROFILE']}/.template`
// console.log(temDownloadDirectory)

module.exports = {
  orgsName,
  temDownloadDirectory,
}