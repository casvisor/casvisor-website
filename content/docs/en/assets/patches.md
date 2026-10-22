---
title: "Patch management"
description: "Casvisor scans SSH assets for pending system updates, installs them and restarts the assets, on Windows through Windows Update and on Linux with apt, dnf or yum, and rescans them on a schedule."
---

**Patches** (`/patches`) shows which of your servers have system updates waiting, and installs them. It works on SSH assets, over the account stored on the asset, on Windows and on Linux. Nothing is installed on the servers for it. The page is for administrators.

## The list

Every SSH asset of the organization is listed, with:

- its state: *Not scanned*, *Up to date*, the error of the last scan, or the job running on it right now (*Scanning*, *Installing*, *Restarting*);
- the number of pending updates, how many of them are security updates, and *Restart required* when the asset is waiting for a restart.

Cards at the top count the assets with updates, the security updates and the assets to restart.

With nothing selected, **Scan all** and **Install on all** act on every asset in the list. Tick assets to turn them into **Scan selected** and **Install on selected**, and to use **Restart selected**. Each row also has its own **Scan** and **Install**.

Click an asset to see its updates:

- **Windows**: each update with its KB number, classification (such as Security Updates or Critical Updates), severity, and *May restart* when installing it may need a restart.
- **Linux**: each package with the repository or suite it comes from, its security severity where the package manager knows it, and the current and new versions.

On this page you can tick single updates and install only those, or **Install all**. Below the updates is the history of jobs on the asset, with who started each one (*Scheduled* for automatic scans), its result, its message, and its full output.

## What it needs on the asset

Casvisor finds out what the asset runs each time, with `uname -s` and, if that is not Linux, `cmd /c ver`; the asset's **OS** field is not used.

**Linux** needs apt, dnf or yum. Scanning works with any account, though on apt the package lists are only refreshed as root. Installing and restarting need root, or an account that can run `sudo` without a password.

**Windows** needs an SSH server with SFTP, such as the OpenSSH server that comes with Windows, and an administrator account. Casvisor uploads PowerShell scripts over SFTP to `C:\ProgramData\Casvisor` and runs them.

## Scanning

- **Windows**: the Windows Update Agent is asked for software updates that are not installed and not hidden. A pending restart is read from the registry.
- **Linux**: apt runs `apt-get update` (as root) and `apt list --upgradable`; dnf and yum list the upgrades and their security advisories. A pending restart is read from `/var/run/reboot-required`, from `needs-restarting -r`, or by comparing the running kernel with the newest installed one.

## Installing

An install runs on the asset itself, detached from the SSH connection, so a dropped connection does not stop it. Casvisor follows its output, reconnecting as needed, and picks it up again if Casvisor itself is restarted in the meantime.

- **Windows**: Windows Update does not install from an SSH logon, so Casvisor registers a scheduled task named **Casvisor Patch** that runs as SYSTEM, downloads and installs the updates, and removes the task when it is done. The job fails if any update fails, or after 6 hours.
- **Linux**: `apt-get upgrade --with-new-pkgs` (or `install --only-upgrade` for chosen packages) with the existing configuration files kept, `dnf upgrade` or `yum update`, without prompts. The output is kept on the asset in `/var/tmp/casvisor-patch/`.

Installing never restarts the asset by itself. When it ends, Casvisor scans the asset again.

Only one job runs on an asset at a time, and at most 8 at once in all.

## Restarting

**Restart** restarts the asset (`shutdown /r` on Windows, `systemctl reboot` on Linux), then waits for it to come back, for up to 30 minutes, and scans it again. A restart is noticed from the asset's boot time or boot ID, so a host that is slow to go down is not mistaken for one that came back.

## Scheduled scans

Assets that have been scanned once are scanned again by themselves when nothing has run on them for `patchScanInterval` hours, 24 by default; `0` turns this off. Assets never scanned are left alone until someone scans them. See [Configuration](../operations/configuration.md#patch-management).

## Network gateways, permissions and logs

- Every connection of a patch job goes through the asset's [network gateway](./network-gateways.md), when it has one.
- Patch jobs are run by administrators and are not subject to [permissions](../access-control/permissions.md) or [command rules](../audit/commands.md). They do not appear in the session list.
- Starting a job is written to the [operation log](../audit/operation-logs.md) as `start-patch-job`. The jobs and their output are kept in the history on the asset's page.
