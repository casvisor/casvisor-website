---
title: "从源码运行"
description: "从仓库编译Casvisor的Go后端和React前端。它用SQLite和自带账号运行，不需要另外安装别的东西。"
---

开发Casvisor要从源码运行。只是不想用Docker的话，也可以从[GitHub Releases](https://github.com/casvisor/casvisor/releases)下载对应系统的压缩包，再照下面的配置改。

## 需要准备

| | 版本 | 用途 |
| --- | --- | --- |
| Go | 1.23及以上 | 后端 |
| Node.js和Yarn | Node 20及以上，Yarn 1 | 前端 |
| MySQL或MariaDB | 5.7 / 10.3及以上 | 可选：不选MySQL时数据库是SQLite |
| Casdoor | | 可选：不用自带账号、改为通过Casdoor登录时需要，见[对接Casdoor](./casdoor.md) |

四种协议都在这个Go程序里处理，旁边不需要再跑别的东西。

## 编译和运行

```bash
git clone https://github.com/casvisor/casvisor
cd casvisor/web
yarn install
yarn build
cd ..
go run .
```

`yarn build`把前端输出到`web/build`，由后端提供。Casvisor监听19000端口（`conf/app.conf`里的`httpport`）。第一次启动时它会建好SQLite数据库`db/casvisor.db`和管理员`admin`，并把密码打印在输出里；打开`http://localhost:19000`用它登录。录像写到`recordings/`。

## 配置

默认配置不用改。你自己的配置写在`conf/app.local.conf`里，它会覆盖`conf/app.conf`，而且不进git。例如改用MySQL、通过Casdoor登录：

```ini
driverName = mysql
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
casdoorEndpoint = https://door.example.com
clientId = <Client ID>
clientSecret = <Client secret>
casdoorOrganization = "<组织>"
casdoorApplication = "<应用>"
```

用MySQL时，第一次启动会建好`dbName`指定的库，所以`dataSourceName`里的账号要有建库权限。每一项的含义见[配置](../operations/configuration.md)。

## 开发前端

前端是React + Vite + shadcn/ui。开发时单独跑Vite，让它把接口请求转给后端：

```bash
cd web
yarn dev
```

它监听18001端口，把`/api`（包括WebSocket）转发到`http://localhost:19000`。要连别的后端，设置环境变量`CASVISOR_BACKEND`。

## 编译到其他系统

后端是纯Go，`CGO_ENABLED=0`即可交叉编译：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o casvisor .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o casvisor.exe .
```

运行时它从工作目录读取`conf/`、`data/`、`swagger/`和`web/build/`，部署时把这几个目录和程序一起拷过去。
