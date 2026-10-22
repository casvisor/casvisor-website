---
title: "File transfer"
description: "Move files to and from SSH and RDP assets: the file panel beside the web terminal and the remote desktop, sftp, scp and rsync through the SSH gateway, and a drive redirected into RDP sessions, allowed by the Upload and Download actions and written to the operation log."
---

Files can be moved to and from **SSH assets** in two ways:

- the **file panel** next to the web terminal, with nothing to install;
- `sftp`, `scp` and `rsync` through the [SSH gateway](./ssh-gateway.md).

and to and from **RDP assets** through a drive that Casvisor redirects into the session, with the same file panel next to the desktop.

All of them are allowed by the **Upload** and **Download** actions of a [permission](../access-control/permissions.md), and write the files they move or change to the [operation log](../audit/operation-logs.md#ssh-and-file-events). VNC and Telnet have no file transfer.

## The file panel

When the user holds Upload or Download on the asset, the SSH terminal and the RDP desktop have a **Files** button, which opens a panel beside them. In SSH sessions the panel uses the SSH connection the terminal already has, through SFTP, so it browses the files as the asset's account. In RDP sessions it shows the redirected drive.

- It opens in the account's home folder for SSH, and at the top of the drive for RDP. **Parent folder**, **Home folder** and **Refresh** move around; click a folder to open it.
- **Download** saves a file to the browser. Double-clicking a file does the same. Folders cannot be downloaded.
- **Upload** sends one or more files to the folder shown. Files can also be dropped onto the panel.
- **New folder**, **Rename** and **Delete**. Delete asks for confirmation and removes a folder with everything in it.

Each action is checked on the server against the user's permission at that moment, not only when the panel opens. The panel only works in the user's own session while it is connected.

## RDP

With Upload or Download on an RDP asset, Casvisor redirects a drive into the session, as the Windows client does with local drives. On the remote desktop it is the drive `casvisor`, at `\\tsclient\casvisor`. Its files are kept on the Casvisor server, in `data/drives/<session>` under the working directory, and the file panel shows the same folder:

- **Into the server**: upload files in the panel, then open or copy them from the drive on the remote desktop.
- **Out of the server**: save or copy files to the drive on the remote desktop, then download them from the panel.

The two actions also limit what the remote side may do with the drive:

| The user has | The remote desktop can |
| --- | --- |
| Upload and Download | Read and write the drive |
| Upload only | Read what was uploaded, but not write, so nothing leaves the server through it |
| Download only | Write to the drive, but only read back what it wrote itself |

The drive lives only as long as the session: its folder is deleted when the session ends, and any left over are deleted when Casvisor starts. Neither the panel nor the drive has a size limit of its own, so the files take space on the Casvisor server while the session lasts.

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

- **File panel in SSH sessions**: each download, uploaded file, new folder, rename and delete is an entry (`sftp-download`, `sftp-upload`, `sftp-mkdir`, `sftp-rename`, `sftp-delete`) with the user, the asset and the path.
- **File panel in RDP sessions**: the same, as `file-download`, `file-upload`, `file-mkdir`, `file-rename` and `file-delete`.
- **The redirected drive**: what the remote desktop does with it is logged too: `file-create`, `file-mkdir`, `file-read`, `file-write` (with the number of bytes, once the file is closed), `file-rename` and `file-delete`.
- **SFTP**, which includes `scp` in OpenSSH 9.0 and later: every file opened for reading or writing, and every new folder, rename, removal and link, is an entry, from `sftp-download` to `sftp-symlink`. Changing permissions or times is not logged.
- **`scp -O` and `rsync`** are not logged file by file. Their command line, which names the paths, is kept in the [command records](../audit/commands.md) of the session.

Listing folders is not logged, and the content of the files is not kept.
