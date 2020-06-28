# 2020 创青春·交子杯 新网银行金融科技挑战赛

本项目为 [新网银行金融科技挑战赛](https://www.kesci.com/custom_landing/xwbank) 小游戏赛道的 DEMO。

## 文件说明

```text
目录
|- backend      # 后端源码
|- front        # 前端源码
|  |- ezgame    # 编译引擎，需要用该引擎编译游戏
|  `- game-src
`- database     # 数据库
```

## 运行方法

1. 将 `ezgame` 放在一个公用的目录下
2. 进入 `ezgame` 目录下执行命令：

   ```shell
   npm i
   npm link
   ```

3. 进入 `game-src` 目录，执行以下命令即可本地运行：

   ```shell
   ez-cli build
   ez-cli run
   ```

4. 执行以下命令即可发布到 `dist/wx` 目录下：

   ```shell
   ez-cli publish wx
   ```
