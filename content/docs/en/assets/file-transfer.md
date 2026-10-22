---
title: "File transfer"
description: "Move files to and from SSH assets with the file panel of the web terminal or with sftp, scp and rsync through the SSH gateway, allowed by the Upload and Download actions and written to the operation log."
---

Files can be moved to and from **SSH assets** in two ways:

- the **file panel** next to the web terminal, with nothing to install;
- `sftp`, `scp` and `rsync` through the [SSH gateway](./ssh-gateway.md).

Both are allowed by the **Upload** and **Download** actions of a [permission](../access-control/permissions.md), and both write the files they move or change to the [operation log](../audit/operation-logs.md#ssh-and-file-events). RDP, VNC and Telnet have no file transfer yet.

## The file panel

When the user holds Upload or Download on the asset, the SSH terminal has a **Files** button in its top right corner, which opens a panel beside the terminal. The panel uses the SSH connection the terminal already has, through SFTP, so it browses the files as the asset's account.

- It opens in the account's home folder. **Parent folder**, **Home folder** and **Refresh** move around; click a folder to open it.
- **Download** saves a file to the browser. Double-clicking a file does the same. Folders cannot be downloaded.
- **Upload** sends one or more files to the folder shown. Files can also be dropped onto the panel.
- **New folder**, **Rename** and **Delete**. Delete asks for confirmation and removes a folder with everything in it.

Each action is checked on the server against the user's permission at that moment, not only when the panel opens. The panel only works in the user's own session while it is connected.

## Which action allows what

| Operation | Web file panel | SFTP, scp, rsync |
| --- | --- | --- |
| List folders, see file details | Upload or Download | Upload or Download |
| Read a file | Download | Download |
| Write or create a file | Upload | Upload |
| Create, rename or delete a file or folder | Upload | Upload |
| Change permissions, owner or times, create links | | Upload |

With only Download, `sftp` can browse and fetch but every change fails with *Permission denied*. With neither, `sftp` is refused with *you have no permission to transfer files on the asset*.

`scp -O`, the old protocol, and `rsync` do not use SFTP. For them the gateway reads the direction from the command the client runs on the asset: receiving files needs Upload, sending them needs Download.

## What is logged

- **File panel**: each download and each uploaded file is an entry (`sftp-download`, `sftp-upload`) with the user, the asset and the path. New folder, rename and delete are API calls and logged as `create-session-dir`, `rename-session-file` and `delete-session-file`.
- **SFTP**, which includes `scp` in OpenSSH 9.0 and later: every file opened for reading or writing, and every new folder, rename, removal and link, is an entry, from `sftp-download` to `sftp-symlink`. Changing permissions or times is not logged.
- **`scp -O` and `rsync`** are not logged file by file. Their command line, which names the paths, is kept in the [command records](../audit/commands.md) of the session.

Listing folders is not logged, and the content of the files is not kept.
