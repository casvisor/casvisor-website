---
title: "对比"
description: "Casvisor和其他开源堡垒机、远程访问网关的比较：JumpServer、Teleport、Warpgate、Apache Guacamole和HashiCorp Boundary，截至2026年10月。"
---

这个领域有好几个不错的开源项目。这一页是为了帮你选型，所以既写Casvisor不一样的地方，也写它落后的地方。内容截至2026年10月，各项目的最新情况请看它们自己的网站。

| | Casvisor | JumpServer | Teleport | Warpgate | Apache Guacamole |
| --- | --- | --- | --- | --- | --- |
| 许可证 | Apache-2.0 | GPL-3.0 | 源码AGPL-3.0；社区版二进制另有条款 | Apache-2.0 | Apache-2.0 |
| 收费版 | 没有 | 企业版 | 企业版 | 没有 | 没有 |
| 开发语言 | Go | Python、Go | Go | Rust | C、Java |
| 浏览器访问 | SSH、RDP、VNC、Telnet | SSH、RDP、VNC、数据库、K8s、应用 | SSH、RDP（Windows）、数据库、K8s、应用 | SSH、RDP、VNC | SSH、RDP、VNC、Telnet、K8s |
| 本地客户端（`ssh`、`scp`、数据库客户端） | 暂不支持 | 支持 | 支持 | 支持 | 不支持 |
| 会话录像 | 暂不支持 | 支持 | 支持 | 支持 | 支持 |
| 身份 | Casdoor：单点登录、多因素、LDAP、SAML、OAuth、用户组 | 自带、LDAP、单点登录 | 自带、单点登录 | 自带、TOTP、OIDC | 自带，可扩展LDAP、单点登录 |
| 访问策略 | Casbin：用户、用户组、资产、标签、动作、IP、有效期 | RBAC、资产授权 | 基于标签的RBAC | 目标上的角色 | 连接权限 |

## 各自适合什么情况

- **JumpServer**功能最全，也是国内的事实标准。它的一部分连接器，例如给本地RDP客户端和数据库客户端用的代理，属于企业版。
- **Teleport**用短期证书做身份，覆盖的基础设施最广。从v16起，社区版二进制只对员工不到100人、年收入低于1000万美元的公司免费。
- **Warpgate**是一个Rust写的单文件程序，透明代理SSH、HTTPS、Kubernetes、MySQL、PostgreSQL、RDP和VNC，带录像和实时查看，没有收费版。目前在协议这一块它比Casvisor做得多。
- **Apache Guacamole**是浏览器远程桌面网关，有自己的用户和连接权限。Casvisor用它的守护进程guacd来连Telnet。
- **HashiCorp Boundary**在2026年10月归档了开源仓库，之后只有HCP Boundary和Boundary Enterprise。

## Casvisor不一样的地方

- **身份交给Casdoor。** 如果你已经在用Casdoor，或者想要它的单点登录、多因素认证、LDAP和SAML，Casvisor直接用它们，权限里也能直接写Casdoor用户组，不用再维护第二套用户目录。
- **策略交给Casbin。** 权限组合了用户和用户组、资产和标签、动作、来源IP段和有效期，判断用的模型就写在[权限页面](../access-control/permissions.md#casbin模型)上。
- **没有企业版。** [路线图](./roadmap.md)上的东西，包括数据库代理和访问申请，都是开源项目本身要做的。

## Casvisor落后的地方

本地SSH客户端、会话录像和回放、命令记录、数据库和Kubernetes访问。这些是[路线图](./roadmap.md)上接下来的几项。如果你现在就需要，上面这些项目都有。
