---
title: "常见问题"
description: "关于Casvisor的常见问题：什么是堡垒机，是否必须用Casdoor，初始密码，登录为什么失败，能否用自己的SSH客户端，资产密码和录像存在哪里，去哪里求助。"
---

## 什么是堡垒机？

放在人和他们要管的系统之间的一台服务器，让所有连接都经过同一个地方，由它决定谁能连，并留下记录。也叫跳板机，规模大一些的产品叫特权访问管理（PAM）。

## 必须用Casdoor吗？

不必。Casvisor开箱就有自己的账号，带用户组和管理员，见[用户和管理员](../access-control/users-and-admins.md)。需要单点登录、多因素认证，或者想通过LDAP、SAML、OIDC或第三方登录来认证用户、让Casvisor接在你现有的目录后面时，再对接同样开源的[Casdoor](../getting-started/casdoor.md)。

## 初始密码是什么？

第一次启动时，Casvisor创建管理员`admin`，并把随机密码打印在日志里：Docker里用`docker logs casvisor`查看。想自己定，就在第一次启动前设置`adminPassword`。它只在一个用户都没有时创建。如果在新装的系统上丢了这个密码，删掉数据库（Docker里是`casvisor-db`卷）重新启动即可；已经有别的管理员时，任何一个管理员都可以在**用户**里给它设新密码。

## 忘了自带账号的密码

让管理员在**用户**里设一个新的。连续输错5次密码后，这个用户从这个地址登录会被拒绝15分钟。

## 通过Casdoor登录时报错

- **Redirect URI不被允许**：把`https://<你的Casvisor>/callback`加进Casdoor应用的Redirect URLs。
- **从Casdoor跳回来后报签名或令牌错误**：Casvisor没拿到应用的证书。请用v1.110.0及以后的版本，并在日志里找`InitAuthConfig`：它在启动时去Casdoor取证书，见[关于证书](../getting-started/casdoor.md#关于证书)。
- **Casvisor连不上Casdoor**：`casdoorEndpoint`要在Casvisor服务器上和浏览器里都能访问。在Docker里，`localhost`指的是容器自己。

## 用户能登录，但看不到资产

他不是管理员，也没有任何已启用的权限允许他此刻、从他所在的地址**连接**任何资产。检查权限的用户和用户组、资产和标签、来源IP和有效期。新加入的Casdoor用户组要等他下次登录才算。

## RDP一连就失败

RDP由Casvisor自己连接，所以Casvisor服务器要能访问资产的3389端口。标签页里的提示会说明是哪一步失败：连接被拒绝或超时，是网络或防火墙的问题；认证错误，是账号的问题。Casvisor使用NLA，只支持旧版RDP安全层的服务器连不上。

## Telnet一连就失败

Telnet由Casvisor自己连接，所以Casvisor服务器（或资产的网域网关）要能访问资产的主机和端口，默认是23。Casvisor在设备的`login:`和`password:`提示处输入保存的账号；提示不一样的设备不会自动输入，用户要自己登录。

## 能用自己的SSH客户端、scp或VS Code吗？

SSH资产可以，经由[SSH网关](../assets/ssh-gateway.md)：在**SSH公钥**页面登记你的公钥，然后`ssh -p 2222 <资产>@<Casvisor主机>`。VS Code Remote还需要权限里有**端口转发**（Forward）。RDP、VNC和Telnet只能在浏览器里连。

## SSH网关提示“Permission denied (publickey)”

网关不认识客户端出示的公钥。检查公钥是否已登记在你要用的那个用户的**SSH公钥**里，以及客户端出示的是不是这把密钥，例如用`ssh -i ~/.ssh/id_ed25519`指定。网关不接受口令。公钥通过以后的其他拒绝，都会以`casvisor: ...`打印出原因。

## 资产的密码存在哪里？

存在Casvisor的数据库里：设了`credentialKey`就加密保存，没设就按原样保存，见[加密](../assets/assets.md#加密)。接口只返回打码后的值，浏览器拿不到。也可以不填账号，让每个用户自己输入。

## Casvisor会录像吗？

会，所有会话都录：SSH、Telnet、VNC和RDP，在**会话**里用浏览器回放。录像是`recordings/`下的文件，Docker里是`/recordings`；存在哪里、保留多久、怎么关掉，见[录像](../audit/recordings.md)。此外，SSH和Telnet会话里执行的[命令](../audit/commands.md)会保留，传过的文件和每一次改动记在操作日志里。

## 有托管版或企业版吗？

没有。Casvisor以Apache-2.0开源，没有收费版。

## 去哪里求助？

在[GitHub](https://github.com/casvisor/casvisor/issues)上提issue，或者到[Discord](https://discord.gg/yfKcuHVAHB)提问。
