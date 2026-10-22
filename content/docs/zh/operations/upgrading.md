---
title: "升级"
description: "Casvisor怎么发版、该跟哪个Docker标签，以及新版本启动时数据库会发生什么。"
---

## 发版

Casvisor通过推送版本tag发版，例如`v1.110.0`。每个版本会出现在[GitHub Releases](https://github.com/casvisor/casvisor/releases)上，带Linux、Windows和macOS的amd64、arm64压缩包（里面有程序、`conf/`、`data/`、`swagger/`和`web/build/`），并发布amd64、arm64的Docker镜像：

| 镜像 | 内容 |
| --- | --- |
| `casbin/casvisor` | 只有Casvisor |
| `casbin/casvisor-all-in-one` | Casvisor加MariaDB和guacd |

两个镜像都带版本号标签，例如`v1.110.0`，`latest`跟随最新版本。生产环境里请固定版本，需要时再主动升级。

## 升级Docker镜像

```bash
docker pull casbin/casvisor-all-in-one:<版本>
docker rm -f casvisor
docker run -d --name casvisor -p 19000:19000 \
  -v "$PWD/app.conf:/conf/app.conf" \
  -v casvisor-db:/var/lib/mysql \
  casbin/casvisor-all-in-one:<版本>
```

用all-in-one镜像时，数据库在`casvisor-db`卷里；没有这个卷，换容器就会丢数据。旧容器停止时，开着的会话会断开；登录会话存成文件（而不是Redis）时，用户要重新登录。

## 数据库

启动时，Casvisor会补上新版本需要的表和列。它不会删除任何东西：新版本不再用的表和列原样留在库里。跨很多个版本升级前请先备份数据库，以便回退。

## 从较早的版本升级

2026年10月，Casvisor收窄成只做堡垒机，改动很大：

- **v1.107.0**去掉了**机器**和**提供商**页面、背后的云同步，以及把日志写上区块链的功能。旧的`machine`和`provider`表还留在库里，不再需要时可以删掉。资产现在自己保存协议、主机、端口和账号，原来基于机器的资产要重新填写才能连接。
- **v1.108.0**改为直接连接SSH和VNC，不再经由guacd。
- **v1.109.0**加入了[权限](../access-control/permissions.md)。在为非管理员用户建好权限之前，他们什么都访问不了。
- **v1.110.0**把RDP也改为直接连接，guacd只有Telnet需要；启动时自己去Casdoor取证书，能配任意Casdoor；新增`credentialKey`加密凭据、SSH私钥、固定主机指纹和`allowedUsers`。已有的资产会在下一次连接时记下指纹。
