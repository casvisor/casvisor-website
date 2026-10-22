---
title: "协议"
description: "Casvisor用Go直接连接SSH、RDP、VNC和Telnet。各协议支持什么、怎么登录、复制和粘贴动作在哪里限制，以及RDP还不支持什么。"
---

| | SSH | VNC | RDP | Telnet |
| --- | --- | --- | --- | --- |
| 默认端口 | 22 | 5900 | 3389 | 23 |
| 由谁处理 | Casvisor（Go） | Casvisor（Go） | Casvisor（Go，gordp） | Casvisor（Go） |
| 浏览器里 | xterm.js终端 | noVNC画布 | 画布 | xterm.js终端 |
| 登录方式 | 私钥、密码、keyboard-interactive | VNC密码 | 用户名和密码，经NLA认证 | 在提示符处输入用户名和密码 |
| 复制、粘贴动作 | 不限制 | 由前端限制 | 由服务端限制 | 不限制 |
| 文件传输 | 文件面板、SFTP、scp、rsync | 无 | 文件面板、重定向的磁盘 | 无 |
| 命令记录和规则 | 有 | 无 | 无 | 有 |
| 录像 | 有 | 有 | 有 | 有 |
| 实时旁观 | 有 | 有 | 有 | 有 |
| 本地客户端 | 经由SSH网关 | 无 | 无 | 无 |

每种协议都可以经由[网域网关](./network-gateways.md)连接；只要没关掉录像，每个会话都会[录像](../audit/recordings.md)。

## SSH

Casvisor用Go的`golang.org/x/crypto/ssh`连接，申请`xterm-256color`终端，通过WebSocket转给浏览器里的xterm.js。终端大小跟随浏览器窗口。

资产有私钥时Casvisor先用私钥登录，再试密码。服务器的主机密钥会被固定：第一次连接时，Casvisor把它的SHA-256指纹记进资产的**指纹**，之后服务器出示的密钥不一样就拒绝连接，并提示用户主机密钥变了。如果这是预期内的变化（比如服务器重装了），清空**指纹**再连一次。

同一个SSH连接还通过SFTP承载终端的[文件面板](./file-transfer.md)。终端里输入的命令会被记录并按[命令规则](../audit/commands.md)检查，管理员可以[实时旁观](../audit/sessions.md#实时旁观)。

SSH资产也可以经由[SSH网关](./ssh-gateway.md)用你自己的`ssh`、`scp`、`sftp`、`rsync`或VS Code Remote连接。[补丁管理](./patches.md)作用的也是SSH资产。

终端用的是浏览器自己的复制粘贴，所以权限里的**复制**和**粘贴**限制不了它。

## VNC

Casvisor自己建立到VNC服务器的TCP连接，完成RFB握手，包括VNC密码认证。浏览器里的noVNC拿到的是一个无需认证的连接，所以VNC密码一直留在服务器上。如果服务器拒绝了密码，它给出的原因会显示给用户。

画面上方的工具栏有全屏、剪贴板对话框和Ctrl+Alt+Del等组合键。只有权限里有**复制**时，服务器上的剪贴板内容才会传给用户；有**粘贴**时，文字才会发到服务器。这项检查在前端执行。

## RDP

Casvisor用[gordp](https://github.com/casvisor/gordp)自己连接RDP，这是为Casvisor写的纯Go RDP客户端。它和服务器协商TLS和网络级身份验证（NLA，即CredSSP加NTLMv2），用资产的账号登录，把桌面发给浏览器，鼠标和键盘再反向传回去。密码不会离开服务器。支持Windows Server、Windows 10和11，以及基于FreeRDP的服务端，例如Ubuntu的远程桌面。

和SSH一样，服务器的TLS证书也会被固定：第一次连接时把它的指纹记进**指纹**，以后证书不一样就拒绝连接。Windows会不时更新自签名的RDP证书，遇到这种情况，清空**指纹**再连一次。

### 画面

- **图形管道。** Casvisor像Windows自带的客户端一样申请RDP图形管道（GFX），并解码其中的ClearCodec和RemoteFX Progressive编码。不走图形管道的服务器会改发位图更新，gordp同样能解码。
- **整帧绘制。** 画面按服务器发来的帧整帧绘制，而不是一块一块地画。
- **高分屏。** 桌面按浏览器的实际像素大小打开，并把显示缩放比例告诉Windows，所以文字是清晰绘制的，而不是拉伸出来的。
- **远程光标。** 鼠标指针用服务器给的形状，例如文本光标或调整大小的箭头。
- **调整大小。** 桌面跟随浏览器窗口的大小，停止拖动半秒后生效，不用重新连接。不支持调整大小的服务器保持原来的大小，桌面缩放到窗口里显示。

工具栏有全屏、剪贴板对话框、允许传文件时的**文件**按钮，以及组合键：Ctrl+Alt+Del、Ctrl+Alt+Backspace、Windows键，以及Windows加D、E、R或X。

### 剪贴板

文字在两个方向都能像平常一样复制：在远程桌面上复制的文字会放进你的剪贴板，浏览器窗口获得焦点时，你剪贴板里的文字会发到远程桌面。工具栏的剪贴板对话框可以手动做同样的事。只交换文字，不交换文件和图片。

两个方向都在服务端限制：没有**复制**时，Casvisor根本不向服务器要剪贴板内容；没有**粘贴**时，浏览器发来的文字会被丢弃。每次复制和粘贴都会以`clipboard-copy`或`clipboard-paste`写进[操作日志](../audit/operation-logs.md)，带上文字内容，最多1000字节。

### 文件传输

用户对资产有**上传**或**下载**时，Casvisor会把一个磁盘重定向进会话，Windows里显示为`\\tsclient\casvisor`；工具栏的**文件**按钮会在桌面旁边打开同一个磁盘的面板。传文件分两步：在面板里上传，再在远程桌面上从这个磁盘打开；或者在远程桌面上存到这个磁盘，再从面板下载。见[文件传输](./file-transfer.md#rdp)。

### 还不支持的

- **H.264。** gordp不解码AVC编码，所以不会申请它们，Windows改发ClearCodec和RemoteFX Progressive。
- **远程应用（RemoteApp）。** 只能打开整个桌面，不能只打开单个发布的程序。
- **输入美式键盘以外的字符**，例如用输入法打字。按键按美式键盘的键位发送。
- **旧版RDP安全层。** 既不支持TLS也不支持NLA的服务器连不上。

## Telnet

Casvisor自己连接Telnet，用和SSH相同的终端显示。它协商`XTERM-256COLOR`终端和窗口大小，所以终端跟随浏览器窗口。

Telnet协议本身没有登录这一步，所以Casvisor替用户输入账号：设备第一次打印出以`login:`、`username:`或`user name:`结尾的提示时发送用户名，第一次出现`password:`提示时发送密码，不区分大小写。资产没有保存账号时，和SSH一样，连接时让用户输入。Casvisor不检查登录是否成功，用户在终端里能看到设备的回应。

Telnet会话里输入的命令和SSH一样会被记录、按[命令规则](../audit/commands.md)检查，管理员也能实时旁观。也和SSH一样，终端用的是浏览器自己的复制粘贴，**复制**和**粘贴**限制不了它；Telnet没有文件传输。

Telnet适合只有它可用的网络设备和老系统；Casvisor（或它的网域网关）和设备之间的所有内容都是明文传输。
