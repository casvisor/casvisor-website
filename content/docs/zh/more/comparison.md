---
title: "对比和其他选择"
seoTitle: "Casvisor与JumpServer、Teleport、Warpgate对比：开源堡垒机怎么选"
description: "Casvisor与JumpServer、Teleport、Warpgate等开源堡垒机的对比：功能、许可证、收费版和差距。"
---

这个领域有好几个不错的开源项目。这一页是为了帮你选型，所以既写Casvisor不一样的地方，也写它落后的地方。内容截至2026年10月，各项目的最新情况请看它们自己的网站。

| | Casvisor | JumpServer | Teleport | Warpgate |
| --- | --- | --- | --- | --- |
| 许可证 | Apache-2.0 | GPL-3.0 | 源码AGPL-3.0；社区版二进制另有条款 | Apache-2.0 |
| 收费版 | 没有 | 企业版 | 企业版 | 没有 |
| 开发语言 | Go | Python、Go | Go | Rust |
| 浏览器访问 | SSH、RDP、VNC、Telnet、MySQL、PostgreSQL、SQL Server、Oracle、Redis、MongoDB、网站（经反向代理，或在替用户登录的远程浏览器里） | SSH、RDP、VNC、数据库、K8s、应用 | SSH、RDP（Windows）、数据库、K8s、应用 | SSH、RDP、VNC |
| 本地客户端（`ssh`、`scp`、数据库客户端） | SSH：`ssh`、`scp`、`sftp`、`rsync`，可从资产列表直接打开Xshell、WinSCP，受审计；mstsc经内置远程桌面网关，其他协议经端口转发，不录像 | 支持 | 支持 | 支持 |
| 会话录像 | SSH、Telnet、VNC、RDP和远程浏览器，在浏览器里回放；数据库语句和网站请求按会话列出 | 支持 | 支持 | 支持 |
| 身份 | 自带（可开TOTP），或Casdoor：单点登录、多因素、LDAP、SAML、OAuth、用户组 | 自带、LDAP、单点登录 | 自带、单点登录 | 自带、TOTP、OIDC |
| 访问策略 | Casbin：用户、用户组、资产、标签、账号、动作、IP、有效期；访问申请与审批 | RBAC、资产授权 | 基于标签的RBAC | 目标上的角色 |

## 开源堡垒机的其他选择

Casvisor不是这个领域唯一的选择。下面是最常被拿来和它比较的几个项目。

### JumpServer的替代品

JumpServer功能最全，也是国内的事实标准。它的一部分连接器，例如给本地RDP客户端和数据库客户端用的代理，属于企业版。Casvisor保持Apache-2.0、没有收费版，目前功能也更少。

### Teleport的替代品

Teleport用短期证书做身份，覆盖的基础设施最广。从v16起，社区版二进制只对员工不到100人、年收入低于1000万美元的公司免费。Casvisor用Casbin管权限、有会话录像，不需要自建证书体系。

### Warpgate的替代品

Warpgate是一个Rust写的单文件程序，透明代理SSH、HTTPS、Kubernetes、MySQL、PostgreSQL、RDP和VNC，带录像和实时查看，没有收费版。目前在协议这一块它比Casvisor做得多；Casvisor带自带账号、Casdoor身份和Casbin策略。

### Boundary的替代品

HashiCorp Boundary在2026年10月归档了开源仓库，之后只有HCP Boundary和Boundary Enterprise。Casvisor保持Apache-2.0，跑在自己的服务器上。

## Casvisor不一样的地方

- **一个程序。** SSH、RDP、VNC、Telnet、六种数据库、SSH网关、录像、网域网关的agent和playbook执行器都在一个Go程序里，默认用SQLite，服务器上什么都不用装。执行Ansible playbook不用装Ansible，Casvisor跑在Windows上也行，每个任务都过命令规则并有录像。
- **身份可以交给Casdoor。** Casvisor有自己的账号；如果你已经在用Casdoor，或者想要它的单点登录、多因素认证、LDAP和SAML，Casvisor直接用它们，权限里也能直接写Casdoor用户组，不用再维护第二套用户目录。
- **策略交给Casbin。** 权限组合了用户和用户组、资产和标签、动作、来源IP段和有效期，判断用的模型就写在[权限页面](../access-control/permissions.md#casbin模型)上。
- **命令规则和权限用同一套范围。** 规则可以写用户、用户组、资产和资产标签，网页终端和本地SSH客户端走的是同一个检查，一条规则两边都管。见[命令记录和命令规则](../audit/commands.md)。
- **没有企业版。** 带自动改密的[系统账号](../assets/accounts.md)、[访问申请](../access-control/access-requests.md)、[数据库控制台](../assets/databases.md)、能执行Ansible playbook的[作业中心](../assets/jobs.md)、在[网域](../assets/network-gateways.md#网域)内故障切换的网域网关、[审计报表](../audit/reports.md)和[syslog转发](../audit/export.md)都在开源项目里，[路线图](./roadmap.md)上的东西也一样。

## Casvisor落后的地方

Kubernetes访问是[路线图](./roadmap.md)上的下一项。数据库只有浏览器里的控制台受审计：SSH以外的本地客户端走的是普通端口转发，不录像。只有SSH资产能自动改密，复制和粘贴动作也限制不了SSH和Telnet终端。如果你现在就需要这些，上面这些项目大多都有。
