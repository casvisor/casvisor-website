---
title: "Connecting"
description: "Users connect from the workbench, which lists the assets they may reach and opens each connection in a tab, or from an asset's Connect button, which opens it on a page of its own."
---

There are two ways into an asset from the browser, and for SSH assets a third: your own SSH client through the [SSH gateway](./ssh-gateway.md).

## The workbench

`/workbench` is where people who are not administrators work, and administrators can use it too. The left side lists every asset the user may connect to, with a search box; the right side holds one tab per open connection.

- Click an asset to open it in a new tab. Clicking an asset that is already open switches to its tab.
- Close a tab to disconnect it. Leaving the page disconnects them all.
- Each tab is its own [session](../audit/sessions.md), so an administrator sees one line per tab in the session list.

## Connecting from the asset list

On **Assets**, the **Connect** button opens the asset at `/access/<organization>/<name>`, a page that holds only the session and fills the browser window. Bookmark it to reach one server directly.

If the asset has no stored username or password, the button asks for what is missing first. See [The account](./assets.md#the-account).

When the SSH gateway is on, SSH assets also have a **Copy SSH command** button, which copies a command such as `ssh -p 2222 web-01@casvisor.example.com` for a terminal on your own machine.

## What happens on connect

1. The browser asks Casvisor to start a session for the asset.
2. Casvisor checks that the user is signed in and that a [permission](../access-control/permissions.md) gives them **Connect** on this asset, from their IP address, right now. Administrators skip this check.
3. Casvisor opens a WebSocket for the session. It checks again that the session was started by the same user and that the permission still holds, then connects to the asset, through its [network gateway](./network-gateways.md) if it has one.
4. The session shows as **Online** in the session list until the tab is closed or an administrator stops it, and is [recorded](../audit/recordings.md) as it goes.

If the check fails, the tab shows why, for example *you have no permission to connect to the asset*.

## Keyboard and clipboard

- **SSH and Telnet** run in an xterm.js terminal: colours, resizing with the window, and the usual copy and paste of the browser. For SSH, with Upload or Download in the permission, the **Files** button in the top right corner opens a [file panel](./file-transfer.md#the-file-panel) beside the terminal.
- **RDP and VNC** run in a canvas, with a toolbar for full screen, the clipboard and key combinations such as Ctrl+Alt+Del. Keys go to the remote side as typed. Clipboard sharing follows the **Copy** and **Paste** actions of the user's permission. RDP follows the size of the browser window and, with Upload or Download, has a **Files** button for [moving files](./file-transfer.md#rdp).

See [Protocols](./protocols.md) for the details of each.
