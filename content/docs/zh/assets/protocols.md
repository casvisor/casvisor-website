---
title: "协议"
description: "Casvisor用Go直接连接SSH、RDP和VNC，经由guacd连接Telnet。各协议目前支持什么、怎么登录，剪贴板限制在哪里执行。"
---

| | SSH | VNC | RDP | Telnet |
| --- | --- | --- | --- | --- |
| 默认端口 | 22 | 5900 | 3389 | 23 |
| 由谁处理 | Casvisor（Go） | Casvisor（Go） | Casvisor（Go，gordp） | guacd |
| 浏览器里 | xterm.js终端 | noVNC画布 | 画布 | Guacamole终端 |
| 登录方式 | 密码、keyboard-interactive | VNC密码 | 用户名和密码，经NLA认证 | 用户名和密码 |
| 复制、粘贴动作 | 暂未限制 | 由前端限制 | 暂时没有剪贴板 | 由guacd限制 |
| 需要guacd | 否 | 否 | 否 | 是 |

## SSH

Casvisor用Go的`golang.org/x/crypto/ssh`连接，申请`xterm-256color`终端，通过WebSocket转给浏览器里的xterm.js。终端大小跟随浏览器窗口。

还不支持：用私钥登录、校验服务器的主机密钥（目前和guacd的默认行为一样，接受任何主机密钥），以及通过Casvisor用自己的`ssh`客户端、`scp`或SFTP连接。这三项都在[路线图](../more/roadmap.md)上。终端用的是浏览器自己的复制粘贴，所以权限里的**复制**和**粘贴**目前限制不了它。

## VNC

Casvisor自己建立到VNC服务器的TCP连接，完成RFB握手，包括VNC密码认证。浏览器里的noVNC拿到的是一个无需认证的连接，所以VNC密码一直留在服务器上。如果服务器拒绝了密码，它给出的原因会显示给用户。

画面上方的工具栏有全屏、剪贴板对话框和Ctrl+Alt+Del等组合键。只有权限里有**复制**时，服务器上的剪贴板内容才会传给用户；有**粘贴**时，文字才会发到服务器。这项检查在前端执行。

## RDP

Casvisor用[gordp](https://github.com/casvisor/gordp)自己连接RDP，这是为Casvisor写的纯Go RDP客户端。Casvisor和服务器协商TLS和网络级身份验证（NLA，即CredSSP加NTLMv2），用资产的账号登录，把画面以图块的形式发给浏览器，鼠标和键盘再反向传回去。密码不会离开服务器。已在默认配置的Windows Server 2022上测试过。

还不支持的：

- **剪贴板。** 没有剪贴板通道，不论权限怎么写，两个方向都复制不了。
- **调整大小。** 桌面大小取连接建立时浏览器区域的大小，之后不变；要改就重新连接。
- **服务器证书。** 接受任何证书，和大多数RDP客户端对待自签名服务器证书的做法一样。
- **磁盘映射、文件传输和远程应用。** 权限里的**上传**和**下载**动作是为文件传输预留的。
- **较新的图像编码**（RemoteFX、GFX、H.264）。服务器会退回到gordp能解码的位图编码。
- **旧版RDP安全层。** 只支持它、不支持TLS或NLA的服务器连不上。

## Telnet

Telnet经由guacd，显示为终端。权限里没有**复制**时，Casvisor会给guacd设置`disable-copy`，远端剪贴板的内容不会到浏览器；没有**粘贴**时设置`disable-paste`。两项都由guacd执行，用户无法在浏览器里绕过。Telnet适合只有它可用的网络设备和老系统；Casvisor和设备之间的所有内容都是明文传输。

## guacd

只有Telnet需要guacd。Casvisor通过`guacamoleEndpoint`（默认`127.0.0.1:4822`）连接它。all-in-one Docker镜像在容器里自带一个；其他情况下运行官方镜像：

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
```

真正去连Telnet主机的是guacd，所以guacd本身要能访问到它们。不要把4822端口开放到Casvisor所在主机以外：guacd自己没有认证。

Telnet也改用Go实现、让一个程序覆盖所有协议，在[路线图](../more/roadmap.md)上。
