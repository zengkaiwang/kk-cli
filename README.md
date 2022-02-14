### 将包变成全局的
- 先创建可执行的脚本 #! /usr/bin/env node
- 配置package.json 中的bin字段
- npm link 链接到本地环境(默认是package.json中的name字段), 方便本地开发调试