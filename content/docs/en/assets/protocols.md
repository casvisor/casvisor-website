---
title: "Protocols"
description: "Casvisor connects to SSH, RDP and VNC natively in Go and to Telnet through guacd. What each protocol supports today, how it logs in and where clipboard control is enforced."
---

| | SSH | VNC | RDP | Telnet |
| --- | --- | --- | --- | --- |
| Default port | 22 | 5900 | 3389 | 23 |
| Handled by | Casvisor (Go) | Casvisor (Go) | Casvisor (Go, gordp) | guacd |
| In the browser | xterm.js terminal | noVNC canvas | Canvas | Guacamole terminal |
| Logs in with | Private key, password, keyboard-interactive | VNC password | Username and password over NLA | Username and password |
| Copy and Paste actions | Not enforced yet | Enforced by the web client | No clipboard yet | Enforced by guacd |
| Needs guacd | No | No | No | Yes |

## SSH

Casvisor connects with Go's `golang.org/x/crypto/ssh`, asks for a `xterm-256color` terminal, and relays it to xterm.js in the browser over a WebSocket. The terminal follows the size of the browser window.

Casvisor logs in with the asset's private key if it has one, then with the password. The server's host key is pinned: on the first connection Casvisor records its SHA-256 fingerprint in the asset's **Fingerprint**, and from then on refuses to connect if the server presents a different key, telling the user that the host key has changed. If the change is expected, because the server was reinstalled for example, clear **Fingerprint** and connect again.

Not yet: connecting with your own `ssh` client, `scp` or SFTP through Casvisor, which is on the [roadmap](../more/roadmap.md). The terminal uses the browser's own copy and paste, so the **Copy** and **Paste** actions of a permission do not restrict it yet.

## VNC

Casvisor opens the TCP connection to the VNC server and performs the RFB handshake itself, including VNC password authentication. The browser, running noVNC, is then offered a connection with no authentication, so the VNC password stays on the server. If the server rejects the password, the reason it gives is shown to the user.

The toolbar over the screen has full screen, a clipboard dialog and key combinations such as Ctrl+Alt+Del. Clipboard text from the server is only passed on when the user's permission includes **Copy**, and text is only sent to the server with **Paste**. This check is made in the web client.

## RDP

Casvisor connects to RDP itself with [gordp](https://github.com/casvisor/gordp), a pure-Go RDP client written for it. Casvisor negotiates TLS and Network Level Authentication (CredSSP with NTLMv2) with the server, logs in with the asset's account, and sends the screen to the browser as image tiles, with mouse and keyboard going back the other way. The password never leaves the server. It is tested against Windows Server 2022 in its default configuration.

As with SSH, the server's TLS certificate is pinned: its fingerprint is recorded in **Fingerprint** on the first connection, and a different certificate later is refused. Windows renews its self-signed RDP certificate from time to time; when that happens, clear **Fingerprint** and connect again.

What it does not do yet:

- **Clipboard.** There is no clipboard channel, so nothing is copied in either direction whatever the permission says.
- **Resizing.** The desktop takes the size of the browser area when the connection opens and keeps it; reconnect to change it.
- **Drive redirection, file transfer and RemoteApp.** The **Upload** and **Download** actions are reserved for file transfer.
- **Newer graphics codecs** (RemoteFX, GFX, H.264). The server falls back to the bitmap codecs gordp decodes.
- **Legacy RDP security.** Servers that only offer it, without TLS or NLA, cannot be reached.

## Telnet

Telnet goes through guacd and is shown as a terminal. Without **Copy** in the permission, Casvisor tells guacd `disable-copy`, so nothing on the remote clipboard reaches the browser; without **Paste**, `disable-paste`. guacd enforces both, so a user cannot get around them from the browser. Use Telnet for network gear and old systems that have nothing else; it sends everything in clear text between Casvisor and the device.

## guacd

Only Telnet needs guacd. Casvisor talks to it at `guacamoleEndpoint` (default `127.0.0.1:4822`). The all-in-one Docker image starts one inside the container. Elsewhere, run the official image:

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
```

guacd needs to reach the Telnet hosts itself, since it is the one that connects to them. Do not publish port 4822 beyond Casvisor's host: guacd has no authentication of its own.

Handling Telnet in Go as well, so that one binary covers every protocol, is on the [roadmap](../more/roadmap.md).
