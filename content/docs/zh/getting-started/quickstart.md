---
title: "用Docker快速上手"
description: "用自带MariaDB和guacd的all-in-one Docker镜像运行Casvisor，通过Casdoor登录，连上第一台服务器。"
---

试用Casvisor最快的办法是all-in-one镜像`casbin/casvisor-all-in-one`。除了Casvisor本身，它还带了做数据库用的MariaDB和连Telnet用的guacd，一个容器就能跑。外面只需要一个用来登录的Casdoor。

## 1. 准备Casdoor

Casvisor没有自己的登录。请用v1.110.0及以后的镜像：更早的版本配v4.10及以后新装的Casdoor时登录不了（见[关于证书](./casdoor.md#关于证书)）。

如果你已经有Casdoor，照[对接Casdoor](./casdoor.md)为Casvisor建一个应用，拿到它的Client ID和Client secret再回来。

如果还没有，就在旁边起一个：

```bash
docker run -d --name casdoor -p 8000:8000 casbin/casdoor-all-in-one
```

打开`http://<你的IP>:8000`，用`admin` / `123`登录，先改掉这个密码，再照[对接Casdoor](./casdoor.md)建应用。全程都用机器的IP或主机名，不要用`localhost`：Casvisor的容器访问Casdoor用的是和浏览器同一个地址，而在容器里`localhost`指的是容器自己。

## 2. 写app.conf

下载默认配置：

```bash
curl -fsSLo app.conf https://raw.githubusercontent.com/casvisor/casvisor/master/conf/app.conf
```

把其中五项Casdoor配置改成你自己的：

```ini
casdoorEndpoint = http://192.168.1.20:8000
clientId = <应用的Client ID>
clientSecret = <应用的Client secret>
casdoorOrganization = "<应用所在的组织>"
casdoorApplication = "<应用名>"
```

`dataSourceName`和`guacamoleEndpoint`保持不变：它们指向镜像里的MariaDB和guacd。每一项的含义见[配置](../operations/configuration.md)。

## 3. 启动Casvisor

```bash
docker run -d --name casvisor -p 19000:19000 \
  -v "$PWD/app.conf:/conf/app.conf" \
  -v casvisor-db:/var/lib/mysql \
  casbin/casvisor-all-in-one
```

第二个卷用来保存数据库，换容器时数据不会丢。第一次启动时Casvisor会建好`casvisor`库和表。

用本地`ssh`、`scp`和VS Code连接的[SSH网关](../assets/ssh-gateway.md)在master分支上。v1.110.0之后发布的镜像会在2222端口上运行它，要用的话在上面的命令里加上`-p 2222:2222`。

## 4. 登录

打开`http://<你的IP>:19000`，页面会跳到Casdoor再跳回来。用应用所在组织的管理员账号（Casdoor里该用户打开了**Is admin**）登录才能看到管理页面；其他用户只有工作台。

如果Casdoor提示重定向地址不被允许，就把`http://<你的IP>:19000/callback`加进应用的**Redirect URLs**。

## 5. 添加服务器并连接

1. 打开**资产**，点**添加**，填好协议、主机、端口，需要的话再填登录用的账号。见[资产](../assets/assets.md)。
2. 点资产上的**连接**，会在新标签页里打开终端或桌面。

管理员能访问所有资产。要让别人也能用，就建一条[权限](../access-control/permissions.md)，写上他们的名字，或者他们所在的Casdoor用户组。

## 不用all-in-one镜像

`casbin/casvisor`是不带MariaDB和guacd的Casvisor。已经有MySQL的时候用它；要连Telnet，再在旁边起一个guacd：

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
docker run -d --name casvisor -p 19000:19000 -v "$PWD/app.conf:/conf/app.conf" casbin/casvisor
```

然后把`dataSourceName`改成你的MySQL，把`guacamoleEndpoint`改成guacd容器，地址要是Casvisor容器能访问到的。仓库里的[docker-compose.yml](https://github.com/casvisor/casvisor/blob/master/docker-compose.yml)会把三个一起启动。
