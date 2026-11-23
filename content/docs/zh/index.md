---
title: "Casvisor文档"
description: "Casvisor开源堡垒机的使用手册，支持SSH、RDP、VNC、Telnet、MySQL、PostgreSQL、SQL Server、Oracle、Redis和MongoDB：安装、登录、资产和系统账号、SSH网关、文件传输、数据库、补丁管理、作业中心、权限、访问申请、会话、录像、命令规则、操作日志、导出和运维。"
---

Casvisor是一个开源堡垒机（跳板机）。用户用Casvisor自带的账号或通过Casdoor登录，看到自己有权访问的服务器，在浏览器标签页里用SSH、RDP、VNC或Telnet连上去，也能连MySQL、PostgreSQL、SQL Server、Oracle、Redis和MongoDB数据库，或者用自己的SSH客户端；Casvisor按你配置的权限检查每一次连接，并录像。

## 入门

- [介绍](./getting-started/introduction.md)：Casvisor做什么，各部分怎么配合
- [用Docker快速上手](./getting-started/quickstart.md)：一个容器，几分钟跑起来
- [对接Casdoor](./getting-started/casdoor.md)：不用自带账号，改为通过Casdoor登录
- [从源码运行](./getting-started/source.md)：自己编译后端和前端

## 使用

- [资产](./assets/assets.md)：用户要连的服务器，以及为它们保存的账号
- [系统账号与改密](./assets/accounts.md)：一个资产多个账号，看不到密码也能连，以及自动改密
- [连接](./assets/connecting.md)：工作台、连接标签页、自己输入账号
- [SSH网关](./assets/ssh-gateway.md)：经由Casvisor用`ssh`、`scp`、`sftp`、`rsync`和VS Code Remote
- [网域网关](./assets/network-gateways.md)：经SSH跳板机或agent访问其他网络里的资产
- [文件传输](./assets/file-transfer.md)：网页终端和远程桌面旁的文件面板，以及上传、下载权限各允许什么
- [协议](./assets/protocols.md)：SSH、RDP、VNC、Telnet和数据库各自支持什么
- [数据库](./assets/databases.md)：在浏览器的控制台里连MySQL、PostgreSQL、SQL Server、Oracle、Redis和MongoDB，每条语句都有记录
- [补丁管理](./assets/patches.md)：扫描系统更新、安装并重启
- [作业中心](./assets/jobs.md)：在多台服务器上批量执行命令、脚本和分发文件
- [用户和管理员](./access-control/users-and-admins.md)：自带账号和它的两步验证，谁管理Casvisor，谁只能连接
- [权限](./access-control/permissions.md)：谁能从哪里、在什么时间、以哪个账号、对哪台资产做什么
- [登录规则](./access-control/login-rules.md)：按用户、IP和时间放行、拒绝或复核登录，以及要求两步验证
- [访问申请](./access-control/access-requests.md)：申请一段时间的访问，以及审批
- [会话](./audit/sessions.md)：在线和历史连接，实时旁观和强制断开
- [录像](./audit/recordings.md)：在浏览器里回放会话，以及录像存在哪里
- [命令记录和命令规则](./audit/commands.md)：SSH和Telnet里执行过的命令、数据库里执行过的语句，以及拦截危险命令
- [操作日志](./audit/operation-logs.md)：通过接口做的每一次改动，以及传过的每个文件
- [导出与syslog转发](./audit/export.md)：导出CSV文件，转发到syslog服务器或SIEM

## 运维

- [配置](./operations/configuration.md)：`conf/app.conf`里的每一项
- [放在反向代理后面](./operations/reverse-proxy.md)：WebSocket、HTTPS和客户端IP
- [升级](./operations/upgrading.md)：版本发布、Docker标签和数据库

## 更多

- [路线图](./more/roadmap.md)：接下来要做什么
- [对比](./more/comparison.md)：和JumpServer、Teleport、Warpgate的比较
- [常见问题](./more/faq.md)
