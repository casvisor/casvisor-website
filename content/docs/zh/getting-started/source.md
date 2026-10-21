---
title: "从源码运行"
description: "从仓库编译Casvisor的Go后端和React前端，用MySQL做数据库，用guacd连接Telnet。"
---

开发Casvisor要从源码运行；目前要配一个用自己证书签名的Casdoor，也得从源码编译（见[对接Casdoor](./casdoor.md#关于证书)）。

## 需要准备

| | 版本 | 用途 |
| --- | --- | --- |
| Go | 1.26及以上 | 后端 |
| Node.js和Yarn | Node 20及以上，Yarn 1 | 前端 |
| MySQL或MariaDB | 5.7 / 10.3及以上 | 资产、权限、会话、操作日志 |
| guacd | 1.5及以上 | 只有Telnet需要；SSH、RDP和VNC不需要 |
| Casdoor | | 登录，见[对接Casdoor](./casdoor.md) |

## 编译和运行

```bash
git clone https://github.com/casvisor/casvisor
cd casvisor/web
yarn install
yarn build
cd ..
go run .
```

`yarn build`把前端输出到`web/build`，由后端提供。Casvisor监听19000端口（`conf/app.conf`里的`httpport`）。第一次启动时它会建好`dbName`指定的库和表，所以`dataSourceName`里的MySQL账号要有建库权限。

需要Telnet时，再启动guacd：

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
```

## 配置

第一次启动前先改`conf/app.conf`：

```ini
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
guacamoleEndpoint = 127.0.0.1:4822
casdoorEndpoint = https://door.example.com
clientId = <Client ID>
clientSecret = <Client secret>
casdoorOrganization = "<组织>"
casdoorApplication = "<应用>"
```

每一项的含义见[配置](../operations/configuration.md)。

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
