---
title: "配置"
description: "Casvisor的conf/app.conf里的每一项：HTTP端口、MySQL连接、guacd、Casdoor应用、Redis会话和操作日志。"
---

Casvisor启动时从工作目录读取`conf/app.conf`。Docker镜像里是`/conf/app.conf`，把你自己的文件挂载到这里。改完要重启Casvisor。

```ini
appname = casvisor
httpport = 19000
runmode = dev
SessionOn = true
copyrequestbody = true
driverName = mysql
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
tableNamePrefix =
isDemoMode = false
logPostOnly = true
redisEndpoint =
guacamoleEndpoint = 127.0.0.1:4822
casdoorEndpoint = https://door.casdoor.com
clientId = b108dacba027db36ec26
clientSecret = 124140638b4f9de7e78e79ba22d451c17bfa9688
casdoorOrganization = "casbin"
casdoorApplication = "app-casvisor"
```

文件里自带的Casdoor配置属于Casbin的公开演示，用它登录不了你自己的Casvisor。请换成你自己的，见[对接Casdoor](../getting-started/casdoor.md)。

## 服务

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `httpport` | `19000` | Casvisor监听的端口，界面、接口和连接用的WebSocket都在这个端口上。 |
| `runmode` | `dev` | Beego的运行模式。`prod`会关掉Beego的开发错误页。 |
| `appname`、`SessionOn`、`copyrequestbody` | | Casvisor依赖的Beego设置，保持不变。 |

## 数据库

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `driverName` | `mysql` | 支持MySQL和MariaDB。 |
| `dataSourceName` | `root:123456@tcp(localhost:3306)/` | MySQL连接串，写到`/`为止，不带库名。 |
| `dbName` | `casvisor` | 数据库名。启动时如果库和表不存在，Casvisor会建好。 |
| `tableNamePrefix` | 空 | 接口规则表的表名前缀，和别的程序共用一个库时用。 |

环境变量`RUNNING_IN_DOCKER`为`true`时，`dataSourceName`里的`localhost`会换成Docker宿主机的地址，这样容器能连到宿主机上的MySQL。

## 连接

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `guacamoleEndpoint` | `127.0.0.1:4822` | guacd监听的地址，只有Telnet用。见[协议](../assets/protocols.md#guacd)。 |

## Casdoor

| 配置项 | 含义 |
| --- | --- |
| `casdoorEndpoint` | Casdoor的地址，浏览器和Casvisor服务器都要能访问，末尾不带斜杠 |
| `clientId`、`clientSecret` | Casdoor应用的Client ID和Client secret |
| `casdoorOrganization` | 应用所在的组织 |
| `casdoorApplication` | 应用名 |

前端编译时用的是Casbin演示站的值，Casvisor提供前端页面时会把它们替换成这几项，所以同一份前端可以配任意Casdoor。

## 会话和日志

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `redisEndpoint` | 空 | 为空时，登录会话以文件形式存在`tmp/`下。填Redis地址（例如`127.0.0.1:6379`）就改存Redis，换容器后用户不用重新登录。 |
| `logPostOnly` | `true` | 只记改动类的调用，见[操作日志](../audit/operation-logs.md)。 |
| `isDemoMode` | `false` | 目前后端没有用到。 |
