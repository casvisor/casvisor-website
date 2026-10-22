---
title: "Commands and command rules"
description: "Casvisor records the commands run in SSH sessions, from the web terminal and the SSH gateway, and command rules block or flag the ones that match a regular expression, for chosen users, groups, assets and asset tags."
---

Casvisor keeps the commands people run on SSH assets, whether from the web terminal or through the [SSH gateway](../assets/ssh-gateway.md), and can stop the ones you name before they run. RDP, VNC and Telnet sessions have no command records.

Both pages are for administrators: **Commands** (`/commands`) and **Command rules** (`/command-rules`).

## How commands are read

**In an interactive shell**, Casvisor follows the session on a virtual screen of its own, the same size as the user's terminal. When the user presses Enter, it reads the line from the end of the prompt to the cursor, as it is shown at that moment. So the command recorded is the one that runs:

- Tab completion, a line recalled from history with the arrow keys, and edits in the middle of the line are all in it.
- Long lines that wrap, and characters such as Chinese, are read correctly.
- Nothing is recorded while a full-screen program such as `vim`, `top` or `less` is open.
- Input the shell does not echo, such as a password typed for `sudo`, is not on the screen and is not recorded.

**For a command given on the `ssh` command line**, such as `ssh web-01 'systemctl restart nginx'`, the command is recorded as the client sent it. This includes the commands that `scp -O` and `rsync` run on the asset.

## The Commands page

Each line is one command: the time, the command, the user, the asset, the client IP, the session, and, when a rule matched, the rule and its action. The list can be searched by command, user, asset, client IP and session. In the [session list](./sessions.md), the **Commands** column counts the commands of each SSH session and links to them.

## Command rules

A command rule names a pattern and what to do when a command matches it.

| Field | Meaning |
| --- | --- |
| Organization, Name | The rule belongs to one organization and applies to its assets. |
| Pattern | A regular expression in Go's syntax (RE2). It matches when it is found anywhere in the command, so anchor it with `^` and `$` to match the whole command. |
| Action | `Block` or `Alert`. |
| Users, Groups | Who it applies to. Leave both empty, or use `*`, for everyone. |
| Assets, Asset tags | Which assets it applies to. Leave both empty, or use `*`, for every asset of the organization. |
| Enabled | Off means the rule is ignored. |

Rules apply to administrators as well. When several rules match, a `Block` rule wins over an `Alert` rule.

Some patterns:

| Pattern | Matches |
| --- | --- |
| `^\s*rm\s+-rf\s+/\s*$` | `rm -rf /`, but not `rm -rf /tmp/x` |
| `\b(shutdown\|reboot\|halt\|poweroff)\b` | Any command that mentions these |
| `^\s*(mkfs\|fdisk\|parted)\b` | Commands that start with these |

### Block

In an interactive shell, Casvisor does not pass on the Enter key. It sends Ctrl+C instead, so the line is cleared without running, and shows a red line in the user's terminal: *[Casvisor] The command is blocked by the rule: ...*. For a command on the `ssh` command line, the gateway refuses it with *casvisor: the command is blocked by the rule: ...* and exit status 1.

The command is recorded with the action `Block`.

### Alert

The command runs as usual and is recorded with the action `Alert` and the rule, so it can be found on the Commands page. Casvisor does not send a notification for it.

## What a rule cannot stop

A rule sees the command line as typed. It can be worked around: by putting the command in a script and running the script, by building it from variables or aliases, by running it inside a full-screen program, or with commands that a pattern does not foresee. Treat Block as a guard against mistakes, and keep the permissions themselves narrow.
