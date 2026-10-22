---
title: "补丁管理"
description: "Casvisor扫描SSH资产上待装的系统更新，安装更新并重启资产：Windows走Windows Update，Linux用apt、dnf或yum，还会定时重新扫描。"
---

**补丁**（`/patches`）显示哪些服务器有待装的系统更新，并能直接安装。它作用于SSH资产，用资产上保存的账号操作，支持Windows和Linux，不需要在服务器上装任何东西。这个页面只有管理员能用。

## 列表

组织里的每个SSH资产都会列出来，包括：

- 状态：*未扫描*、*已是最新*、上次扫描的错误，或者正在它上面运行的任务（*正在扫描*、*正在安装*、*正在重启*）；
- 待装更新的数量、其中安全更新的数量，资产在等待重启时显示*需要重启*。

页面上方的卡片统计有待装更新的资产、安全更新和需要重启的资产。

什么都没选时，**全部扫描**和**全部安装**作用于列表里的所有资产。勾选资产后它们变成**扫描所选**和**安装所选**，**重启所选**也只对勾选的资产可用。每一行也有自己的**扫描**和**安装**。

点资产可以看它的更新：

- **Windows**：每个更新的KB编号、分类（例如安全更新、关键更新）、严重程度，安装后可能需要重启的标*可能要重启*。
- **Linux**：每个软件包的来源仓库或套件、包管理器知道时的安全严重程度，以及当前版本和新版本。

在这个页面上可以勾选单个更新只装它们，也可以**全部安装**。下面是这个资产上的任务历史：谁启动的（自动扫描显示*定时*）、结果、消息和完整输出。

## 资产上需要什么

Casvisor每次都会自己判断资产运行的系统：先执行`uname -s`，不是Linux再执行`cmd /c ver`；不看资产的**操作系统**字段。

**Linux**需要apt、dnf或yum。任何账号都能扫描，不过apt只有root才会刷新软件包列表。安装和重启需要root，或者能免密执行`sudo`的账号。

**Windows**需要一个支持SFTP的SSH服务端，例如Windows自带的OpenSSH服务端，以及管理员账号。Casvisor通过SFTP把PowerShell脚本传到`C:\ProgramData\Casvisor`下再运行。

## 扫描

- **Windows**：向Windows Update Agent查询未安装、未隐藏的软件更新。是否等待重启从注册表读取。
- **Linux**：apt执行`apt-get update`（root时）和`apt list --upgradable`；dnf和yum列出可升级的包和它们的安全公告。是否等待重启看`/var/run/reboot-required`、`needs-restarting -r`，或者比较正在运行的内核和最新安装的内核。

## 安装

安装在资产上独立运行，和SSH连接脱钩，所以连接断了也不会中断。Casvisor持续读取它的输出，需要时重新连接；Casvisor自己在这期间重启了，也会接着跟进。

- **Windows**：Windows Update不允许从SSH登录下载安装更新，所以Casvisor注册一个名为**Casvisor Patch**、以SYSTEM身份运行的计划任务，由它下载并安装更新，完成后删掉这个任务。有任何更新装失败，或超过6小时，任务就算失败。
- **Linux**：`apt-get upgrade --with-new-pkgs`（只装选中的包时是`install --only-upgrade`，保留现有配置文件）、`dnf upgrade`或`yum update`，全程不提问。输出保存在资产的`/var/tmp/casvisor-patch/`里。

安装完不会自动重启资产。安装结束后，Casvisor会重新扫描一次。

一个资产上同时只运行一个任务，全部加起来最多同时运行8个。

## 重启

**重启**会重启资产（Windows上是`shutdown /r`，Linux上是`systemctl reboot`），然后等它恢复，最多等30分钟，再重新扫描。是否重启过是看资产的启动时间或boot ID判断的，所以关机慢的主机不会被误当成已经重启回来。

## 定时扫描

扫描过一次的资产，如果`patchScanInterval`小时（默认24）内没有运行过任务，会自动重新扫描；设为`0`关闭。从没扫描过的资产在有人扫描它之前不会自动扫描。见[配置](../operations/configuration.md#补丁管理)。

## 网域网关、权限和日志

- 资产配了[网域网关](./network-gateways.md)时，补丁任务的每个连接都经由它。
- 补丁任务由管理员执行，不受[权限](../access-control/permissions.md)和[命令规则](../audit/commands.md)限制，也不会出现在会话列表里。
- 启动任务会以`start-patch-job`写进[操作日志](../audit/operation-logs.md)。任务和它们的输出保存在资产页面的历史里。
