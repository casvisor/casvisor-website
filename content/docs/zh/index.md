---
title: "Casvisor文档"
description: "Casvisor开源堡垒机的使用手册，支持SSH、RDP、VNC和Telnet：安装、Casdoor登录、资产、SSH网关、文件传输、权限、会话、命令规则、操作日志和运维。"
---

Casvisor是一个开源堡垒机（跳板机）。用户通过Casdoor登录，看到自己有权访问的服务器，在浏览器标签页里用SSH、RDP、VNC或Telnet连上去，或者用自己的SSH客户端；Casvisor按你配置的权限检查每一次连接，并留下记录。

## 入门

- [介绍](./getting-started/introduction.md)：Casvisor做什么，各部分怎么配合
- [用Docker快速上手](./getting-started/quickstart.md)：一个容器，几分钟跑起来
- [对接Casdoor](./getting-started/casdoor.md)：Casvisor登录要用的组织、应用和证书
- [从源码运行](./getting-started/source.md)：自己编译后端和前端

## 使用

- [资产](./assets/assets.md)：用户要连的服务器，以及为它们保存的账号
- [连接](./assets/connecting.md)：工作台、连接标签页、自己输入账号
- [SSH网关](./assets/ssh-gateway.md)：经由Casvisor用`ssh`、`scp`、`sftp`、`rsync`和VS Code Remote
- [文件传输](./assets/file-transfer.md)：网页终端的文件面板，以及上传、下载权限各允许什么
- [协议](./assets/protocols.md)：SSH、RDP、VNC、Telnet各自支持什么
- [用户和管理员](./access-control/users-and-admins.md)：谁管理Casvisor，谁只能连接
- [权限](./access-control/permissions.md)：谁能从哪里、在什么时间、对哪台资产做什么
- [会话](./audit/sessions.md)：在线和历史连接，实时旁观和强制断开
- [命令记录和命令规则](./audit/commands.md)：SSH里执行过的命令，以及拦截危险命令
- [操作日志](./audit/operation-logs.md)：通过接口做的每一次改动，以及传过的每个文件

## 运维

- [配置](./operations/configuration.md)：`conf/app.conf`里的每一项
- [放在反向代理后面](./operations/reverse-proxy.md)：WebSocket、HTTPS和客户端IP
- [升级](./operations/upgrading.md)：版本发布、Docker标签和数据库

## 更多

- [路线图](./more/roadmap.md)：接下来要做什么
- [对比](./more/comparison.md)：和JumpServer、Teleport、Warpgate、Guacamole的比较
- [常见问题](./more/faq.md)
