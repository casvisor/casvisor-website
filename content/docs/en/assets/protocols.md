---
title: "Protocols"
description: "Casvisor connects to SSH and VNC natively in Go and to RDP and Telnet through guacd. What each protocol supports today, how it logs in and where clipboard control is enforced."
---

| | SSH | VNC | RDP | Telnet |
| --- | --- | --- | --- | --- |
| Default port | 22 | 5900 | 3389 | 23 |
| Handled by | Casvisor (Go) | Casvisor (Go) | guacd | guacd |
| In the browser | xterm.js terminal | noVNC canvas | Guacamole canvas | Guacamole terminal |
| Logs in with | Password, keyboard-interactive | VNC password | Username and password (NLA, TLS or RDP security) | Username and password |
| Copy and Paste actions | Not enforced yet | Enforced by the web client | Enforced by guacd | Enforced by guacd |
| Needs guacd | No | No | Yes | Yes |

## SSH

Casvisor connects with Go's `golang.org/x/crypto/ssh`, asks for a `xterm-256color` terminal, and relays it to xterm.js in the browser over a WebSocket. The terminal follows the size of the browser window.

Not yet: logging in with a private key, checking the server's host key (any host key is accepted, as guacd does by default), and connecting with your own `ssh` client, `scp` or SFTP through Casvisor. All three are on the [roadmap](../more/roadmap.md). The terminal uses the browser's own copy and paste, so the **Copy** and **Paste** actions of a permission do not restrict it yet.

## VNC

Casvisor opens the TCP connection to the VNC server and performs the RFB handshake itself, including VNC password authentication. The browser, running noVNC, is then offered a connection with no authentication, so the VNC password stays on the server. If the server rejects the password, the reason it gives is shown to the user.

The toolbar over the screen has full screen, a clipboard dialog and key combinations such as Ctrl+Alt+Del. Clipboard text from the server is only passed on when the user's permission includes **Copy**, and text is only sent to the server with **Paste**. This check is made in the web client.

## RDP

RDP goes through guacd. Casvisor passes the host, port and account, accepts any server certificate (`ignore-cert`), and lets the server pick NLA, TLS or standard RDP security (`security=any`). The desktop resizes with the browser window.

Without **Copy** in the permission, Casvisor tells guacd `disable-copy`, so nothing on the remote clipboard reaches the browser; without **Paste**, `disable-paste`. guacd enforces both, so a user cannot get around them from the browser.

guacd's own drive redirection and file transfer are not exposed in the interface yet; the **Upload** and **Download** actions are reserved for them.

## Telnet

Telnet also goes through guacd and is shown as a terminal, with the same `disable-copy` and `disable-paste` handling as RDP. Use it for network gear and old systems that have nothing else; it sends everything in clear text between Casvisor and the device.

## guacd

Casvisor talks to guacd at `guacamoleEndpoint` (default `127.0.0.1:4822`). The all-in-one Docker image starts one inside the container. Elsewhere, run the official image:

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
```

guacd needs to reach the RDP and Telnet hosts itself, since it is the one that connects to them. Do not publish port 4822 beyond Casvisor's host: guacd has no authentication of its own.

Replacing guacd for RDP with a Go implementation, so that one binary covers every protocol, is on the [roadmap](../more/roadmap.md).
