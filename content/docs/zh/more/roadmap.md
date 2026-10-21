---
title: "路线图"
description: "Casvisor接下来要做的：从配置读取证书、加密的凭据保险箱、用本地SSH客户端连接、会话录像和回放，然后是数据库、Kubernetes和访问申请。"
---

Casvisor正在公开地重做成一个完整的堡垒机。下面是工作的先后顺序。进展会体现在[casvisor/casvisor](https://github.com/casvisor/casvisor)的提交和本手册的更新里。欢迎在[issue](https://github.com/casvisor/casvisor/issues)里提想法和反对意见。

## 已完成

- 收窄成只做堡垒机：去掉了云主机管理和区块链日志（v1.107.0）。
- SSH和VNC用Go直接处理，VNC密码留在服务器上（v1.108.0）。
- [权限](../access-control/permissions.md)：用户、用户组、资产、资产标签、动作、来源IP、有效期，用Casbin判断（v1.109.0）。
- 新的前端，基于React、Vite和shadcn/ui。

## 接下来：能放心用于生产的堡垒机

1. **从配置读取Casdoor证书**，让Docker镜像能配任意Casdoor使用，而不是只认旧的内置密钥。见[对接Casdoor](../getting-started/casdoor.md#关于证书)。
2. **凭据保险箱。** 密码和SSH私钥加密保存，一个资产可以有多个账号，权限里写明用户能用哪个账号。用户始终看不到它们。
3. **原生SSH网关。** 通过Casvisor用自己的`ssh`、`scp`、SFTP客户端或VS Code Remote连接，形如`ssh 用户@资产@casvisor`，和网页终端用同一套权限。记录命令，危险命令可以拦截。
4. **录像和回放。** 每个会话都录像，SSH存成asciinema格式，图形会话存成Guacamole录像，在浏览器里回放。管理员能实时旁观。记录文件传输。
5. **部署更简单。** 一个程序，默认用SQLite，一个自带guacd的compose文件，首次启动有设置页，不再默认指向公开演示站。
6. **用Go实现RDP**，让一个程序覆盖所有协议，不再需要guacd。

## 然后：别的堡垒机收费的功能

- MySQL和PostgreSQL代理，带SQL审计。
- Kubernetes访问。
- 访问申请：申请资产，审批通过后获得，到期自动收回。
- 自动修改资产上的密码。
- 远程应用（RemoteApp），只发布单个Windows程序。
- 从云账号导入资产。

## 再往后

- **AI智能体网关。** 给编程智能体和AI运维一个受控的SSH和MCP入口：命令要过策略，高危命令等人确认，全程记录。
- **国内合规**：等保三级对堡垒机的要求，以及SM2、SM3、SM4国密算法。

## 不打算做的

管理云主机和把日志写上区块链，这是Casvisor旧版本做过的事，两者都是有意去掉的。
