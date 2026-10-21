---
title: "常见问题"
description: "关于Casvisor的常见问题：什么是堡垒机，是否必须用Casdoor，登录为什么失败，资产密码存在哪里，去哪里求助。"
---

## 什么是堡垒机？

放在人和他们要管的系统之间的一台服务器，让所有连接都经过同一个地方，由它决定谁能连，并留下记录。也叫跳板机，规模大一些的产品叫特权访问管理（PAM）。

## 必须用Casdoor吗？

是的。Casvisor只通过Casdoor登录，用户和用户组也来自Casdoor。Casdoor同样开源，它自己又能通过LDAP、SAML、OIDC或第三方登录来认证用户，所以Casvisor可以接在你现有的目录后面。见[对接Casdoor](../getting-started/casdoor.md)。

## 登录时报错

- **Redirect URI不被允许**：把`https://<你的Casvisor>/callback`加进Casdoor应用的Redirect URLs。
- **从Casdoor跳回来后报签名或令牌错误**：应用的证书不是Casvisor用来验签的那张。从v4.10起新装的Casdoor都是这种情况，见[关于证书](../getting-started/casdoor.md#关于证书)。
- **Casvisor连不上Casdoor**：`casdoorEndpoint`要在Casvisor服务器上和浏览器里都能访问。在Docker里，`localhost`指的是容器自己。

## 用户能登录，但看不到资产

他不是管理员，也没有任何已启用的权限允许他此刻、从他所在的地址**连接**任何资产。检查权限的用户和用户组、资产和标签、来源IP和有效期。新加入的Casdoor用户组要等他下次登录才算。

## RDP或Telnet一连就失败

这两种协议经由guacd。检查guacd在`guacamoleEndpoint`上运行着，并且guacd本身能访问资产的主机和端口。SSH和VNC不经过guacd，如果它们正常而RDP不行，问题多半在guacd。

## 资产的密码存在哪里？

按原样存在Casvisor的MySQL数据库里；接口只返回打码后的值，浏览器拿不到。加密存储在[路线图](./roadmap.md)上。在那之前，请保护好数据库和备份，或者不填账号，让每个用户自己输入。

## Casvisor会录像吗？

还不会。会话列表记录了谁、从哪里、连了什么、连了多久，操作日志记录了每一次改动。录像和回放在[路线图](./roadmap.md)上。

## 有托管版或企业版吗？

没有。Casvisor以Apache-2.0开源，没有收费版。

## 去哪里求助？

在[GitHub](https://github.com/casvisor/casvisor/issues)上提issue，或者到[Discord](https://discord.gg/yfKcuHVAHB)提问。
