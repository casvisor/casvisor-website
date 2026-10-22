---
title: "配置"
description: "Casvisor的conf/app.conf里的每一项：HTTP端口、SQLite或MySQL、自带账号或Casdoor、SSH网关、录像、补丁扫描、Redis会话和操作日志。"
---

Casvisor启动时从工作目录读取`conf/app.conf`。Docker镜像里是`/conf/app.conf`。改完要重启Casvisor。

有两种办法把你自己的配置和仓库里的文件分开：

- **`conf/app.local.conf`**，格式相同，其中每一项都会覆盖`conf/app.conf`。它不进git，所以拉新版本时不会冲突，`dataSourceName`、`clientSecret`和`credentialKey`就放在这里。
- **同名环境变量**，会覆盖两个文件，例如`docker run -e driverName=mysql ...`。下面表格里的配置项都可以这样传，只有`httpport`、`runmode`、`redisEndpoint`和Beego的设置只从文件读取。

```ini
appname = casvisor
httpport = 19000
runmode = dev
SessionOn = true
copyrequestbody = true
driverName = sqlite
dataSourceName = db/casvisor.db
dbName =
tableNamePrefix =
isDemoMode = false
logPostOnly = true
redisEndpoint =
casdoorEndpoint =
clientId =
clientSecret =
casdoorOrganization = "casvisor"
casdoorApplication =
adminPassword =
sshGatewayPort =
sshGatewayHost =
recordingPath =
recordingRetentionDays =
disableRecording = false
```

按仓库里的这份文件，Casvisor把数据存在`db/`下的SQLite里，用自己的账号登录。

## 服务

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `httpport` | `19000` | Casvisor监听的端口，界面、接口和连接用的WebSocket都在这个端口上。 |
| `runmode` | `dev` | Beego的运行模式。`prod`会关掉Beego的开发错误页。 |
| `appname`、`SessionOn`、`copyrequestbody` | | Casvisor依赖的Beego设置，保持不变。 |

## 数据库

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `driverName` | `sqlite` | `sqlite`，或者`mysql`（MySQL和MariaDB）。 |
| `dataSourceName` | `db/casvisor.db` | SQLite时是数据库文件，相对于工作目录（Docker镜像里是`/db/casvisor.db`），所在目录不存在时会自动创建。MySQL时是连接串，写到`/`为止，不带库名，例如`root:123456@tcp(localhost:3306)/`。 |
| `dbName` | 空 | 只用于MySQL：数据库名。启动时如果库不存在，Casvisor会建好。 |
| `tableNamePrefix` | 空 | 接口规则表的表名前缀，和别的程序共用一个库时用。 |

Casvisor启动时会建好它的表，以及新版本需要的列。SQLite以WAL模式运行，遇到锁最多等10秒，一个Casvisor足够用；数据库要放在另一台服务器上，或者要和你别的MySQL库一起备份时，用MySQL。

环境变量`RUNNING_IN_DOCKER`为`true`时，`dataSourceName`里的`localhost`会换成Docker宿主机的地址，这样容器能连到宿主机上的MySQL。

## 登录

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `casdoorEndpoint` | 空 | 为空时，Casvisor用自己的账号登录。填上Casdoor的地址（浏览器和Casvisor服务器都要能访问，末尾不带斜杠），就改为通过Casdoor登录。 |
| `clientId`、`clientSecret` | 空 | Casdoor应用的Client ID和Client secret。 |
| `casdoorOrganization` | `casvisor` | 用Casdoor时，是应用所在的组织。用自带账号时，是这些账号以及它们建的资产和权限所属的组织。 |
| `casdoorApplication` | 空 | Casdoor应用名。 |
| `adminPassword` | 空 | 只用于自带账号：还没有任何用户时创建的第一个管理员`admin`的密码。为空时随机生成，并在日志里打印一次。之后不再使用。 |
| `allowedUsers` | 空 | 只允许这些用户登录，逗号分隔的`组织/用户名`。为空时所有人都能登录。见[用户和管理员](../access-control/users-and-admins.md#限制谁能登录)。 |

见[对接Casdoor](../getting-started/casdoor.md)和[用户和管理员](../access-control/users-and-admins.md)。Casvisor提供前端页面时会把Casdoor的配置写进去，`casdoorEndpoint`为空时前端显示自己的登录表单，所以同一份前端两种方式都能用。

## 连接

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `sshGatewayPort` | 空；Docker镜像里是`2222` | [SSH网关](../assets/ssh-gateway.md)的端口，监听所有网卡。为空表示关闭网关。Docker镜像用环境变量设置了它，所以在容器里要关掉就传`-e sshGatewayPort=`。`isDemoMode = true`时网关总是关闭。 |
| `sshGatewayHost` | 空 | 用户复制的SSH命令里显示的主机名。为空时用网页界面的主机名。 |

## 录像

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `recordingPath` | 空 | [录像](../audit/recordings.md)写到哪里。为空时是工作目录下的`recordings/`，Docker镜像里是`/recordings`。 |
| `recordingRetentionDays` | 空 | 超过这么多天的录像会被删除，每小时检查一次。为空或`0`表示永久保留。 |
| `disableRecording` | `false` | 设为`true`后新会话不再录像，已有的录像仍能回放。 |

## 补丁管理

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `patchScanInterval` | `24` | 扫描过的资产隔多少小时自动[重新扫描更新](../assets/patches.md)。`0`表示关闭定时扫描。 |

## 会话和日志

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `redisEndpoint` | 空 | 为空时，登录会话以文件形式存在`tmp/`下。填Redis地址（例如`127.0.0.1:6379`）就改存Redis，换容器后用户不用重新登录。 |
| `logPostOnly` | `true` | 只记改动类的调用，见[操作日志](../audit/operation-logs.md)。 |
| `isDemoMode` | `false` | 公开演示用：会话15分钟后自动结束，每个客户端IP同时只能开少量会话，用户只能停止自己的会话，SSH网关和定时补丁扫描都不开。 |

## 安全

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `credentialKey` | 空 | 用来加密保存的密码和私钥，见[加密](../assets/assets.md#加密)。 |
