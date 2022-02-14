### 将包变成全局的
- 先创建可执行的脚本 #! /usr/bin/env node
- 配置package.json 中的bin字段
- npm link 链接到本地环境(默认是package.json中的name字段), 方便本地开发调试
- npm unlink --force 可以取消link

> npm link 相当于将当前模块连接到npm目录下, npm目录可以可以直接访问, 所以当前包就可以访问了

### 开发脚手架的思路
- 1) 配置可执行命令 commander 
  - npm install commander
- 2) 实现命令行跟用户交互的功能 inquirer
- 3) 将项目模板下载下来 download-git-repo
- 4) 根据用户的选择, 动态的生成项目模板内容 metalsmith
