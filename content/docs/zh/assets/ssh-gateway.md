---
title: "SSH网关"
description: "用本地的ssh、scp、sftp、rsync、Xshell或VS Code Remote经由Casvisor连接SSH资产：用登记过的公钥登录，在用户名里写资产名，和网页终端用同一套权限、命令规则和会话列表。"
---

除了网页终端，Casvisor自己也能接受SSH连接，用户可以用平时就在用的工具连SSH资产：`ssh`、`scp`、`sftp`、`rsync`、Xshell或VS Code Remote。用户用在Casvisor里登记过的公钥登录网关，Casvisor再用资产自己的账号登录资产。和在浏览器里一样，[权限](../access-control/permissions.md)、[命令规则](../audit/commands.md)和[会话列表](../audit/sessions.md)都照常生效。

## 开启

网关监听`sshGatewayPort`指定的端口：

- `conf/app.conf`里它是空的，即网关默认关闭。
- Docker镜像设置了环境变量`sshGatewayPort=2222`，所以在容器里网关是开着的。用`-p 2222:2222`把端口映射出来。要关掉，传一个空值：`-e sshGatewayPort=`。
- `isDemoMode = true`时，不论端口怎么设，网关都不开。

`sshGatewayHost`是给用户复制的命令里显示的主机名。留空就用用户打开Casvisor时的主机名；SSH要通过别的域名访问时（例如`ssh.example.com`）就设成它。见[配置](../operations/configuration.md#连接)。

网关第一次启动时会生成自己的Ed25519主机密钥，存在数据库里（设了`credentialKey`就加密保存），所以换容器后密钥不变，共用一个数据库的多台Casvisor也是同一个密钥。它的SHA-256指纹写在日志`SSH gateway listening on port 2222`那一行里，**SSH公钥**页面上也有；第一次连接时，和`ssh`显示的指纹对一下。

网关是独立TCP端口上的普通SSH，不经过HTTPS反向代理。见[放在反向代理后面](../operations/reverse-proxy.md#ssh网关)。

## 登记公钥

网关只认公钥，不支持口令登录，所以它碰不到Casvisor或Casdoor账号的密码；网页登录时的多因素认证对它也不适用。

1. 还没有密钥的话，用`ssh-keygen -t ed25519`生成一个。
2. 在Casvisor里打开**SSH公钥**页面（`/ssh-keys`），点**添加SSH公钥**，粘贴`~/.ssh/id_ed25519.pub`的内容。

每个用户都能在这里管理自己的公钥，不用找管理员。一个公钥只能属于一个用户。页面上列出每个公钥的指纹和最近使用时间，删掉公钥后它立刻就不能再登录。

每次连接时，网关都会重新读取用户（从自带账号或Casdoor）：被禁用或删除的用户，或者不在`allowedUsers`里的用户，即使登记了公钥也会被拒绝。用户组和管理员标记同样是现读的，不沿用之前的网页登录。

## 连接

用户名决定网关打开哪个资产：

| 命令 | 打开 |
| --- | --- |
| `ssh -p 2222 web-01@casvisor.example.com` | 你所在组织的资产`web-01` |
| `ssh -p 2222 alice@web-01@casvisor.example.com` | 同上，前面加上你的Casvisor用户名，必须是公钥的主人 |
| `ssh -p 2222 other-org/web-01@casvisor.example.com` | 别的组织的资产。只有Casdoor`built-in`组织的用户能连 |
| `ssh -p 2222 alice@casvisor.example.com` | 用户名写你自己、不写资产：弹出一个菜单，列出你能连的SSH资产 |

菜单按编号、名称、地址和显示名称列出资产，输入编号或名称就连上去，输入`q`退出。这是给Xshell这类只保存一个主机和一个用户名的工具用的。

**资产**页面上，SSH资产有一个**复制SSH命令**按钮，复制出来的命令已经填好了端口和主机。

只能连SSH资产，而且资产要保存了**用户名**：网关用资产保存的账号（私钥或密码）登录资产，没法向用户要。没有用户名的资产会被拒绝，并提示找管理员设置账号。资产的主机密钥和网页终端一样会被固定，见[协议](./protocols.md#ssh)。

不想每次都输端口，可以把网关写进`~/.ssh/config`：

```text
Host web-01
    HostName casvisor.example.com
    Port 2222
    User web-01
```

之后`ssh web-01`、`scp file web-01:`和VS Code Remote都可以直接用`web-01`这个名字。

如果公钥已经通过、连接仍被拒绝，原因会以`casvisor: ...`打印出来，例如*you have no permission to connect to the asset: web-01*。

## 能做什么

| 用途 | 需要的动作 |
| --- | --- |
| 交互式shell（`ssh`），执行命令（`ssh web-01 uptime`），退出码原样返回 | Connect |
| `sftp`，以及OpenSSH 9.0起默认走SFTP的`scp` | Connect，写文件要Upload，读文件要Download |
| `scp -O`（旧版scp协议） | Connect，按方向要Upload或Download |
| 经SSH的`rsync` | Connect，按方向要Upload或Download |
| 本地端口转发（`ssh -L`）和Unix socket转发，VS Code Remote要用 | Connect和Forward |

每种文件操作需要Upload还是Download，见[文件传输](./file-transfer.md)。

转发的连接从资产上发起，和直接SSH登录资产时一样，所以`ssh -L 5432:localhost:5432`连到的是资产本机上的数据库。

一律拒绝：远程端口转发（`ssh -R`）、agent转发（`ssh -A`）和X11转发（`ssh -X`）。

## 会话、命令和审计

经由网关的一个SSH连接就是一个[会话](../audit/sessions.md)，不论它里面开了多少个shell、传输和转发。会话的用户代理是客户端的SSH版本，例如`SSH-2.0-OpenSSH_9.6`。管理员可以像停止别的会话一样停止它，允许它的权限被收回时它也会被断开。交互式shell会被[录像](../audit/recordings.md)，也能实时旁观；只执行命令、传文件或做端口转发的连接没有录像。

命令会被记录，并按[命令规则](../audit/commands.md)检查：交互式shell里输入的命令和网页终端一样读取，`ssh`命令行上带的命令按客户端发来的原文记录。连上资产、每个新的转发目标、经SFTP读写的每个文件，以及新建文件夹、重命名、删除和建链接，都会记进[操作日志](../audit/operation-logs.md#ssh和文件事件)。
