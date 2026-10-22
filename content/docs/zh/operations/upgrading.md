---
title: "升级"
description: "Casvisor怎么发版、该跟哪个Docker标签、新版本启动时数据库会发生什么，以及升级原来用MySQL和Casdoor的部署时要检查什么。"
---

## 发版

Casvisor通过推送版本tag发版，例如`v1.110.0`。每个版本会出现在[GitHub Releases](https://github.com/casvisor/casvisor/releases)上，带Linux、Windows和macOS的amd64、arm64压缩包（里面有程序、`conf/`、`data/`、`swagger/`和`web/build/`），并发布amd64、arm64的Docker镜像：

| 镜像 | 内容 |
| --- | --- |
| `casbin/casvisor` | Casvisor，不另外配置时用SQLite |
| `casbin/casvisor-all-in-one` | Casvisor加自带的MariaDB，并已配置好使用它 |

推送`v1.2.3`这样的tag时，两个镜像都会发布`1.2.3`、`v1.2.3`、`1.2`、`1`和`latest`几个标签；`v1.2.3-beta.1`这样的预发布tag只发布`1.2.3-beta.1`和`v1.2.3-beta.1`。生产环境里请固定版本，需要时再主动升级。

## 升级Docker镜像

```bash
docker pull casbin/casvisor:<版本>
docker rm -f casvisor
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -v casvisor-db:/db -v casvisor-recordings:/recordings \
  casbin/casvisor:<版本>
```

新容器要用和旧容器相同的卷、端口和环境变量启动。SQLite数据库在挂到`/db`的卷里，录像在挂到`/recordings`的卷里；用all-in-one镜像时，数据库在`/var/lib/mysql`。没有这些卷，换容器就会丢数据。旧容器停止时，开着的会话会断开；登录会话存成文件（而不是Redis）时，用户要重新登录。

## 数据库

启动时，Casvisor会补上新版本需要的表和列。它不会删除任何东西：新版本不再用的表和列原样留在库里。跨很多个版本升级前请先备份数据库，以便回退。

## 从较早的版本升级

2026年10月，Casvisor收窄成只做堡垒机，改动很大：

- **v1.107.0**去掉了**机器**和**提供商**页面、背后的云同步，以及把日志写上区块链的功能。旧的`machine`和`provider`表还留在库里，不再需要时可以删掉。资产现在自己保存协议、主机、端口和账号，原来基于机器的资产要重新填写才能连接。
- **v1.109.0**加入了[权限](../access-control/permissions.md)。在为非管理员用户建好权限之前，他们什么都访问不了。
- **v1.110.0**启动时自己去Casdoor取证书，能配任意Casdoor；新增`credentialKey`加密凭据、SSH私钥、固定主机指纹和`allowedUsers`。已有的资产会在下一次连接时记下指纹。

## 升级原来用MySQL和Casdoor的部署

Casvisor不另外配置时用SQLite和自带账号。升级原来配了MySQL和Casdoor的Casvisor时：

- **数据库。** 在挂载的`app.conf`里或用环境变量保留`driverName = mysql`，以及`dataSourceName`和`dbName`。没有它们，Casvisor会在一个新的空SQLite库上启动。all-in-one镜像自己为它的MariaDB设好了这几项。
- **登录。** 设了`casdoorEndpoint`就什么都不变。新拷贝的默认`app.conf`里它是空的，会切换到[自带账号](../access-control/users-and-admins.md)，记得把你的Casdoor配置搬过去。
- **录像。** 现在每个会话都会[录像](../audit/recordings.md)。在Docker里给`/recordings`挂一个卷，录像才不会随容器丢失；不想永久保留就设`recordingRetentionDays`，或者用`disableRecording = true`关掉录像。
