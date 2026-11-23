---
title: "本地客户端"
seoTitle: "Casvisor：用一次性链接在Xshell、WinSCP、mstsc里打开资产"
description: "在资产列表里直接用你电脑上的客户端打开资产：SSH客户端（如Xshell）和SFTP客户端（如WinSCP）经SSH网关连接，远程桌面连接（mstsc）经Casvisor内置的远程桌面网关连接，用一次性令牌代替登记公钥。"
---

除了浏览器，资产也可以直接从资产列表用你电脑上的客户端打开。在**资产**页面上，每个资产都有一个**用本地客户端打开**按钮，点开是适合这个资产的菜单。菜单里的每个链接和命令都带一个一次性令牌：只能用一次，两分钟内有效，代表你和你连接时用的账号，所以不用先[登记公钥](./ssh-gateway.md#登记公钥)。

| 资产 | 菜单项 | 作用 |
| --- | --- | --- |
| SSH | **用SSH客户端打开** | 打开`ssh://<令牌>@<主机>:<端口>`，Xshell、SecureCRT、Termius等能处理`ssh://`链接的客户端会接手 |
| SSH | **用SFTP客户端打开** | 用WinSCP、FileZilla等能处理`sftp://`链接的客户端打开`sftp://<令牌>@<主机>:<端口>` |
| SSH | **复制一次性SSH命令** | 复制`ssh -p 2222 <令牌>@casvisor.example.com`，在任意终端里用 |
| RDP | **用远程桌面连接（mstsc）打开** | 下载一个用mstsc打开的`.rdp`文件，见[远程桌面连接](#远程桌面连接) |
| 其他 | **复制一次性端口转发命令** | 复制`ssh -p 2222 -N -L 13389:win-01:3389 <令牌>@casvisor.example.com`，见[端口转发到其他资产](./ssh-gateway.md#端口转发到其他资产) |

菜单里也保留了用已登记公钥的命令，这些命令不会过期。SSH相关的菜单项要开启[SSH网关](./ssh-gateway.md)；远程桌面那一项要用HTTPS打开网页界面才会出现。

## SSH和SFTP客户端

令牌就是SSH用户名。客户端用SSH的`none`方式登录（常见客户端都会先试这种方式），网关把它带到签发令牌时的资产和账号，所以客户端不需要口令和密钥。之后和用公钥登录一样：重新检查权限，[登录规则](../access-control/login-rules.md)照常生效，交互式shell会录像并按[命令规则](../audit/commands.md)检查，文件传输受上传和下载权限控制。

用过的令牌或超过两分钟的令牌会被拒绝，显示`Permission denied`，重新打开菜单取一个新的即可。端口转发用的令牌只能转发端口，而且只能转发到它自己的资产，用它开shell会被拒绝。

## 远程桌面连接

Casvisor内置了一个远程桌面网关，在网页界面地址的`/remoteDesktopGateway/`下。**用远程桌面连接（mstsc）打开**会下载`<资产名>.rdp`，请在两分钟内打开。文件里把Casvisor设为网关（`gatewayhostname`），带上令牌作为网关访问令牌，并填好账号的用户名。之后mstsc经Casvisor连到资产，资产有[网域网关](./network-gateways.md)时经由它连接。

- 需要资产的**连接**和**端口转发**（Forward）权限。
- Windows口令由mstsc自己询问：Casvisor不会代填账号的口令，所以要用你知道的账号登录。
- RDP会话在mstsc和资产之间端到端加密，Casvisor看不到其中的内容。它在[会话](../audit/sessions.md)列表里以`tunnel`模式列出，管理员可以停止，收回端口转发权限时会断开，并以`rdp-gateway`写入[操作日志](../audit/operation-logs.md)，但不录像，也不按命令规则检查。
- 网关会告诉mstsc哪些东西不带进会话：没有复制和粘贴两项权限就关剪贴板，没有上传和下载两项权限就关本地磁盘，打印机、串口和即插即用设备一律关闭。
- 文件没有签名，mstsc连接前会提示发布者未知。
- mstsc只连证书可信的HTTPS网关，所以只有用HTTPS打开网页界面时才显示这一项。放在反向代理后面时，代理要放行网关的请求，见[放在反向代理后面](../operations/reverse-proxy.md#远程桌面网关)。

在`conf/app.conf`里设置`disableRdGateway = true`可以关闭这个网关。`isDemoMode = true`时它总是关闭的。

## 令牌

令牌由`POST /api/add-client-token?assetId=<组织>/<名称>&kind=<ssh|tunnel|rdp>&account=<账号>`为当前登录的用户签发。用户必须有以这个账号连接该资产的**连接**权限，`tunnel`和`rdp`还要有**端口转发**权限。令牌存在内存里，重启后失效，用过一次就删除。
