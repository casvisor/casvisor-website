---
title: "Protocols"
description: "Casvisor connects to SSH, RDP, VNC and Telnet natively in Go. What each protocol supports, how it logs in, where the Copy and Paste actions are enforced, and what RDP does not do yet."
---

| | SSH | VNC | RDP | Telnet |
| --- | --- | --- | --- | --- |
| Default port | 22 | 5900 | 3389 | 23 |
| Handled by | Casvisor (Go) | Casvisor (Go) | Casvisor (Go, gordp) | Casvisor (Go) |
| In the browser | xterm.js terminal | noVNC canvas | Canvas | xterm.js terminal |
| Logs in with | Private key, password, keyboard-interactive | VNC password | Username and password over NLA | Username and password typed at the prompts |
| Copy and Paste actions | Not enforced | Enforced by the web client | Enforced by the server | Not enforced |
| File transfer | File panel, SFTP, scp, rsync | No | File panel, redirected drive | No |
| Command records and rules | Yes | No | No | Yes |
| Recording | Yes | Yes | Yes | Yes |
| Live view | Yes | Yes | Yes | Yes |
| Native clients | Through the SSH gateway | No | No | No |

Every protocol can go through a [network gateway](./network-gateways.md), and every session is [recorded](../audit/recordings.md) unless recording is turned off.

## SSH

Casvisor connects with Go's `golang.org/x/crypto/ssh`, asks for a `xterm-256color` terminal, and relays it to xterm.js in the browser over a WebSocket. The terminal follows the size of the browser window.

Casvisor logs in with the asset's private key if it has one, then with the password. The server's host key is pinned: on the first connection Casvisor records its SHA-256 fingerprint in the asset's **Fingerprint**, and from then on refuses to connect if the server presents a different key, telling the user that the host key has changed. If the change is expected, because the server was reinstalled for example, clear **Fingerprint** and connect again.

The same SSH connection carries the [file panel](./file-transfer.md) of the terminal, over SFTP. Commands typed in the terminal are recorded and checked against the [command rules](../audit/commands.md), and administrators can [watch the session live](../audit/sessions.md#watching-a-session-live).

SSH assets can also be reached with your own `ssh`, `scp`, `sftp`, `rsync` or VS Code Remote through the [SSH gateway](./ssh-gateway.md). They are also the assets [patch management](./patches.md) works on.

The terminal uses the browser's own copy and paste, so the **Copy** and **Paste** actions of a permission do not restrict it.

## VNC

Casvisor opens the TCP connection to the VNC server and performs the RFB handshake itself, including VNC password authentication. The browser, running noVNC, is then offered a connection with no authentication, so the VNC password stays on the server. If the server rejects the password, the reason it gives is shown to the user.

The toolbar over the screen has full screen, a clipboard dialog and key combinations such as Ctrl+Alt+Del. Clipboard text from the server is only passed on when the user's permission includes **Copy**, and text is only sent to the server with **Paste**. This check is made in the web client.

## RDP

Casvisor connects to RDP itself with [gordp](https://github.com/casvisor/gordp), a pure-Go RDP client written for it. It negotiates TLS and Network Level Authentication (CredSSP with NTLMv2) with the server, logs in with the asset's account, and sends the desktop to the browser, with mouse and keyboard going back the other way. The password never leaves the server. It works with Windows Server, Windows 10 and 11, and FreeRDP-based servers such as Ubuntu's remote desktop.

As with SSH, the server's TLS certificate is pinned: its fingerprint is recorded in **Fingerprint** on the first connection, and a different certificate later is refused. Windows renews its self-signed RDP certificate from time to time; when that happens, clear **Fingerprint** and connect again.

### The screen

- **Graphics pipeline.** Casvisor asks for the RDP graphics pipeline (GFX), as the Windows client does, and decodes its ClearCodec and RemoteFX Progressive codecs. Servers that do not use it send bitmap updates instead, which gordp decodes as well.
- **Whole frames.** The screen is drawn a frame at a time, as the server sends it, rather than tile by tile.
- **High-DPI screens.** The desktop is opened at the browser's real pixel size, and Windows is told the display scale, so text is drawn sharp rather than stretched.
- **The remote cursor.** The mouse pointer takes the shape the server gives it, such as the text cursor or a resize arrow.
- **Resizing.** The desktop follows the size of the browser window, half a second after you stop resizing, without reconnecting. A server that does not support resizing keeps its size, and the desktop is scaled to fit.

The toolbar has full screen, a clipboard dialog, a **Files** button when file transfer is allowed, and key combinations: Ctrl+Alt+Del, Ctrl+Alt+Backspace, the Windows key, and Windows with D, E, R or X.

### Clipboard

Text is copied in both directions as you would expect: text copied on the remote desktop is put on your clipboard, and your clipboard is sent to the remote side when the browser window gets focus. The clipboard dialog of the toolbar does the same by hand. Only text is exchanged, not files or images.

Both directions are enforced on the server: without **Copy**, Casvisor never asks the server for its clipboard; without **Paste**, text from the browser is dropped. Every copy and paste is written to the [operation log](../audit/operation-logs.md) as `clipboard-copy` or `clipboard-paste`, with the text, up to 1000 bytes.

### File transfer

When the user holds **Upload** or **Download** on the asset, Casvisor redirects a drive into the session, which Windows shows as `\\tsclient\casvisor`, and the toolbar's **Files** button opens a panel beside the desktop for the same drive. Users move files in two steps: upload them to the panel and open them from the drive on the remote desktop, or save them to the drive on the remote desktop and download them from the panel. See [File transfer](./file-transfer.md#rdp).

### What it does not do yet

- **H.264.** gordp does not decode the AVC codecs, so it does not offer them, and Windows sends ClearCodec and RemoteFX Progressive instead.
- **RemoteApp.** Only whole desktops are opened, not single published programs.
- **Typing characters outside the US keyboard layout**, such as through an input method. Keys are sent as the keys of a US keyboard.
- **Legacy RDP security.** Servers that offer neither TLS nor NLA cannot be reached.

## Telnet

Casvisor connects to Telnet itself and shows it in the same terminal as SSH. It negotiates an `XTERM-256COLOR` terminal and its window size, so the terminal follows the browser window.

Telnet has no login of its own in the protocol, so Casvisor types the account for the user: when the device first prints a prompt ending in `login:`, `username:` or `user name:`, it sends the username, and at the first `password:` prompt the password, in any letter case. If the asset has no stored account, the user is asked for it when connecting, as for SSH. Casvisor does not check whether the login worked; the user sees the device's answer in the terminal.

Commands typed in Telnet sessions are recorded and checked against the [command rules](../audit/commands.md) exactly as for SSH, and administrators can watch the session live. As for SSH, the terminal uses the browser's own copy and paste, so **Copy** and **Paste** do not restrict it, and there is no file transfer.

Use Telnet for network gear and old systems that have nothing else; it sends everything in clear text between Casvisor, or its network gateway, and the device.
