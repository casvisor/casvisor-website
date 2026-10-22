---
title: "用Docker快速上手"
description: "一条docker run运行Casvisor：开箱即用SQLite和自带账号，在日志里找到管理员密码，然后添加服务器并连接。"
---

Casvisor开箱就能独立运行：数据库用SQLite，没有配置Casdoor时用它自己的账号登录。试用只需要一个容器。

## 1. 启动Casvisor

```bash
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -v casvisor-db:/db -v casvisor-recordings:/recordings \
  casbin/casvisor
```

- 19000端口是网页和接口。2222端口是[SSH网关](../assets/ssh-gateway.md)，用来以本地的`ssh`、`scp`和VS Code连接；用不到的话可以去掉`-p 2222:2222`。
- `casvisor-db`卷保存SQLite数据库，`casvisor-recordings`卷保存[会话录像](../audit/recordings.md)，换容器时都不会丢。镜像以UID 1000运行，如果挂载的是宿主机目录而不是命名卷，要让这个用户能写。

## 2. 找到管理员密码

第一次启动、还没有任何用户时，Casvisor会创建管理员`admin`，生成一个随机密码并打印在日志里：

```bash
docker logs casvisor
```

```text
========================================================================
Casvisor created the administrator "admin" with the password: 7kQm2xT9wRp4ZbNa , sign in and change it in My Account
========================================================================
```

想自己定初始密码，就在`docker run`命令里加上`-e adminPassword=<密码>`，至少8个字符。它只在创建第一个账号时使用，之后改密码要在**我的账户**里改。

## 3. 登录

打开`http://<你的IP>:19000`，用`admin`和这个密码登录。然后在右上角的菜单里打开**我的账户**，改掉密码。

## 4. 添加服务器并连接

1. 打开**资产**，点**添加**，填好协议、主机、端口，需要的话再填登录用的账号。见[资产](../assets/assets.md)。
2. 点资产上的**连接**，会在新标签页里打开终端或桌面。

管理员能访问所有资产。要让别人也能用，就在**用户**里加上他们（见[用户和管理员](../access-control/users-and-admins.md)），再给他们一条[权限](../access-control/permissions.md)。每个会话都会录像，在**会话**里回放。

## 用Docker Compose

仓库里的[docker-compose.yml](https://github.com/casvisor/casvisor/blob/master/docker-compose.yml)做的是同样的事：开放19000和2222端口，用卷保存数据库，并留了一项`adminPassword`用来设初始密码。

## 用MySQL

一个Casvisor用SQLite就够了。要把数据放在MySQL或MariaDB里，用环境变量传入数据库配置：

```bash
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -e driverName=mysql \
  -e dataSourceName='casvisor:secret@tcp(192.168.1.30:3306)/' \
  -e dbName=casvisor \
  -v casvisor-recordings:/recordings \
  casbin/casvisor
```

Casvisor第一次启动时会建好数据库和表，所以这个账号要有建库的权限。见[配置](../operations/configuration.md#数据库)。

镜像`casbin/casvisor-all-in-one`自带MariaDB并已配置好使用它，同样可以单独运行。它把数据库放在`/var/lib/mysql`，要在这里挂一个卷（`-v casvisor-db:/var/lib/mysql`），否则数据会随容器一起删掉。

## 用Casdoor登录

Casvisor也可以不用自己的账号，改为通过[Casdoor](https://casdoor.ai)登录，以使用单点登录、多因素认证、LDAP、SAML和第三方登录，并在权限里使用Casdoor的用户组。设置了`casdoorEndpoint`就会切换过去。见[对接Casdoor](./casdoor.md)。
