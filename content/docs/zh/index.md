---
title: "Casvisor文档"
description: "Casvisor开源堡垒机的使用手册，支持SSH、RDP、VNC和Telnet：安装、登录、资产、SSH网关、文件传输、补丁管理、权限、会话、录像、命令规则、操作日志和运维。"
---

Casvisor是一个开源堡垒机（跳板机）。用户用Casvisor自带的账号或通过Casdoor登录，看到自己有权访问的服务器，在浏览器标签页里用SSH、RDP、VNC或Telnet连上去，或者用自己的SSH客户端；Casvisor按你配置的权限检查每一次连接，并录像。

## 入门

- [介绍](./getting-started/introduction.md)：Casvisor做什么，各部分怎么配合
- [用Docker快速上手](./getting-started/quickstart.md)：一个容器，几分钟跑起来
- [对接Casdoor](./getting-started/casdoor.md)：不用自带账号，改为通过Casdoor登录
- [从源码运行](./getting-started/source.md)：自己编译后端和前端

## 使用

- [资产](./assets/assets.md)：用户要连的服务器，以及为它们保存的账号
- [连接](./assets/connecting.md)：工作台、连接标签页、自己输入账号
- [SSH网关](./assets/ssh-gateway.md)：经由Casvisor用`ssh`、`scp`、`sftp`、`rsync`和VS Code Remote
- [网域网关](./assets/network-gateways.md)：经SSH跳板机或agent访问其他网络里的资产
- [文件传输](./assets/file-transfer.md)：网页终端和远程桌面旁的文件面板，以及上传、下载权限各允许什么
- [协议](./assets/protocols.md)：SSH、RDP、VNC、Telnet各自支持什么
- [补丁管理](./assets/patches.md)：扫描系统更新、安装并重启
- [用户和管理员](./access-control/users-and-admins.md)：自带账号，谁管理Casvisor，谁只能连接
- [权限](./access-control/permissions.md)：谁能从哪里、在什么时间、对哪台资产做什么
- [会话](./audit/sessions.md)：在线和历史连接，实时旁观和强制断开
- [录像](./audit/recordings.md)：在浏览器里回放会话，以及录像存在哪里
- [命令记录和命令规则](./audit/commands.md)：SSH和Telnet里执行过的命令，以及拦截危险命令
- [操作日志](./audit/operation-logs.md)：通过接口做的每一次改动，以及传过的每个文件

## 运维

- [配置](./operations/configuration.md)：`conf/app.conf`里的每一项
- [放在反向代理后面](./operations/reverse-proxy.md)：WebSocket、HTTPS和客户端IP
- [升级](./operations/upgrading.md)：版本发布、Docker标签和数据库

## 更多

- [路线图](./more/roadmap.md)：接下来要做什么
- [对比](./more/comparison.md)：和JumpServer、Teleport、Warpgate、Guacamole的比较
- [常见问题](./more/faq.md)
