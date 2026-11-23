---
title: "连接方式规则"
seoTitle: "Casvisor：按用户、资产和账号限制浏览器、SSH、SFTP、端口转发和mstsc"
description: "连接方式规则按用户、用户组、资产、资产标签和系统账号，放行或拒绝连接资产的方式：浏览器、经SSH网关的SSH客户端、SFTP/scp/rsync、端口转发、远程桌面连接、kubectl和经数据库代理的数据库客户端。"
---

[权限](./permissions.md)决定用户能连哪些资产、能做什么；连接方式规则决定用户**怎么**连。比如：外包人员只能用浏览器，会话有录像、剪贴板受权限控制；生产环境不许端口转发，因为转发的流量原样透传；数据库服务器不许SFTP。这个页面只对管理员开放：**连接方式规则**（`/connect-rules`）。

## 连接方式

| 方式 | 包括 |
| --- | --- |
| 浏览器 | 网页终端、浏览器里的VNC和RDP、数据库控制台、[网站](../assets/websites.md)和文件面板 |
| SSH客户端 | 经[SSH网关](../assets/ssh-gateway.md)的终端和命令：`ssh`、Xshell、VS Code Remote |
| SFTP客户端、scp和rsync | 经SSH网关的文件传输：`sftp`、WinSCP、FileZilla、`scp`和`rsync` |
| 端口转发 | 经SSH网关的`ssh -L`，以及[本地客户端](../assets/local-clients.md)菜单里的一次性端口转发命令 |
| 远程桌面连接 | 经远程桌面网关的mstsc |
| kubectl | 用Casvisor签发的kubeconfig、经[Kubernetes代理](../assets/kubernetes.md#kubectl)的kubectl、Lens等Kubernetes客户端 |
| 数据库客户端 | 经[数据库代理](../assets/local-clients.md#数据库客户端)的DBeaver、Navicat、DataGrip、`mysql`、`psql`等；被拒绝的用户取不到数据库令牌，之前签发的令牌连接时也会被拒绝 |

## 字段

| 字段 | 含义 |
| --- | --- |
| 优先级 | 规则按优先级从小到大依次匹配，第一条匹配的规则生效。 |
| 动作 | **拒绝**或**放行**。 |
| 连接方式 | 规则管哪些连接方式，留空表示所有方式。 |
| 系统账号 | 规则管资产的哪些[系统账号](../assets/accounts.md)，例如`root`，留空表示所有账号。 |
| 用户、用户组 | 规则管哪些人，两项都空表示所有人。 |
| 资产、资产标签 | 规则管哪些资产，两项都空表示所有资产。 |
| 启用 | 关闭后规则不生效。 |

用户、用户组、资产、标签和账号里填`*`表示全部。没有规则匹配时按权限照常连接，所以规则只能收紧连接方式，不能授予访问。要给范围更大的拒绝规则开例外，就在它前面放一条优先级更小的放行规则，例如优先级10对用户组`ops`**放行**，优先级50对所有人**拒绝**。

## 在哪里生效

每次建立连接时检查：在浏览器里打开资产，经SSH网关登录后开shell、执行命令、SFTP或转发端口，在本地客户端菜单里生成一次性链接或命令，以及mstsc连到远程桌面网关时。被拒绝时会说明是哪条规则，例如*the connect rule: no-forward does not let you connect to the asset: db-01 with port forwarding*。规则对管理员同样生效。改规则只影响新的连接，已经连着的会话不受影响。
