---
title: "Jobs"
seoTitle: "Casvisor: run commands, scripts and Ansible playbooks on many servers"
description: "Jobs run a command, a Bash or PowerShell script, a file transfer or an Ansible playbook on many SSH assets at once, picked by name, tag or asset tree node, with a timeout and a concurrency limit. Output and results are kept per asset, command rules apply, and each asset's run is a recorded session."
---

**Jobs** (`/jobs`) run the same thing on many servers at once: a command, a script, a file to copy onto them, or an [Ansible playbook](#ansible-playbooks). They work on SSH assets, Linux and Windows, over the account stored on the asset, with nothing installed on the servers. The page is for administrators.

## Starting a job

**New job** asks for:

| Field | Meaning |
| --- | --- |
| Name | Optional, such as *Check disk space*, to find the job in the list. |
| Type | **Command**, **Script**, **File transfer** or **Ansible playbook**. |
| Assets, Asset tags, Nodes | The assets to run on, by name, every SSH asset that has one of the tags, and every SSH asset in one of the asset tree nodes or below them, as they are when the job starts. Only SSH assets can run jobs; assets of other protocols are left out. The form shows the assets the job will run on. |
| Command | For a command: one command line. |
| Script type, Script | For a script: **Bash** or **PowerShell**, and the script. |
| File, Target path | For a file transfer: the file, uploaded to Casvisor first, up to 1 GB, and where to put it. |
| Playbook, Files, Variables, Check mode | For a playbook: see [Ansible playbooks](#ansible-playbooks). |
| Timeout (seconds) | How long each asset may take, 60 by default (1800 for a playbook) and at most a day. An asset still running after it is stopped. |
| Concurrency | How many assets run at the same time, 10 by default and at most 100. |

**Run on N assets** starts it. The job runs in the background, so the page can be closed.

## How each type runs

Casvisor connects to each asset over SSH as the asset's own account, through its [network gateway](./network-gateways.md) when it has one, finds out whether it is Linux or Unix (with `uname -s`) or Windows, and then:

- **Command**: on Linux and Unix, runs it with `sh -c`; on Windows, hands it to the OpenSSH server's shell, `cmd` unless PowerShell has been made the default.
- **Bash script**: feeds the script to `bash -s` on the asset. A Windows asset fails with a message to pick PowerShell.
- **PowerShell script**: uploads the script over SFTP, to `/tmp` on Linux and `C:\ProgramData\Casvisor\run` on Windows, runs it with `powershell` on Windows or `pwsh` on Linux, and deletes it afterwards.
- **File transfer**: copies the file over SFTP. A target path ending in `/`, or naming a folder that exists, gets the file with its own name inside; any other path is the file's new name. Missing folders are created, and an existing file is overwritten. Windows paths such as `C:\temp\a.txt` work.

On Linux, when the asset has the `timeout` command, the command runs under it, so the timeout also stops the processes it started. Otherwise the command is signalled and the connection cut when the time is up.

A command or script succeeds when it exits with 0, and a file transfer when the file is written. The account needs the rights for what the job does; for anything that needs root, use `sudo` in the command, which works without a password prompt only if the account may run it so.

## Ansible playbooks

A job of the type **Ansible playbook** runs a playbook on its assets. Casvisor runs it itself, over the same SSH connections as the other jobs: Ansible is not needed on Casvisor, which also runs on Windows, nor on the assets, which only need `sh`. Every task goes through the command rules, command review, recording and network gateways like any other command.

| Field | Meaning |
| --- | --- |
| Playbook | The playbook in YAML, typed in or opened from a `.yml` file. |
| Files | The files that `copy` and `template` take as `src` and that `script` runs. They are matched by name: `src: files/nginx.conf` uses the attached `nginx.conf`. |
| Variables | Extra variables in YAML or JSON, as `ansible-playbook -e` gives them. They override every other variable. |
| Check mode | Runs the playbook as `ansible-playbook --check` does: the modules report what they would change without changing it. |

**Check playbook** checks the playbook without running it, and so does starting the job: invalid YAML, an unknown keyword, an unsupported module, option or Jinja2 expression, a handler that does not exist and a file that is not attached are all reported before anything runs, with the play and task they are in.

### How a playbook runs

The inventory is the job's assets. Each asset is a host named after the asset, and is in a group for its tag and one for each of its nodes and their parent nodes, so `hosts:` can be `all`, an asset name, a tag, a node, a pattern such as `web*`, or a list with `!` to leave out and `&` to require, such as `dc1:!db`. A play whose hosts don't pick an asset is skipped on it.

Each asset runs the plays in order, task by task, independently of the other assets, as Ansible's `free` strategy does; the concurrency of the job says how many assets run at once. When a task fails and its errors are not ignored, the asset stops there, as in Ansible. Handlers run at the end of the play, once each, when a task that notified them changed something.

Commands run as the asset's account. `become: true` runs them with `sudo`, as root or as `become_user`; when the asset has a password, it is given to `sudo` when asked, otherwise the account needs passwordless sudo. Only the `sudo` become method is supported.

Unless `gather_facts: false`, the first play collects a few facts: `ansible_distribution`, `ansible_distribution_version`, `ansible_distribution_major_version`, `ansible_os_family`, `ansible_system`, `ansible_kernel`, `ansible_architecture`, `ansible_hostname`, `ansible_fqdn`, `ansible_pkg_mgr` and `ansible_service_mgr`, also under `ansible_facts`. `inventory_hostname`, `ansible_host`, `ansible_port`, `ansible_user`, `group_names` and `ansible_check_mode` are set too.

### What is supported

Modules, with their usual options, also as `ansible.builtin.<name>`:

| Module | Notes |
| --- | --- |
| `command`, `shell`, `raw`, `script` | `chdir`, `creates`, `removes`; `executable` for `shell` and `script`. `command` runs without a shell, as in Ansible. `script` uploads an attached file and runs it with its arguments. |
| `copy`, `template` | `src` (an attached file) or `content`, `dest`, `mode`, `owner`, `group`, `force`, `backup`. Only changed when the checksum differs. |
| `file` | `state` `file`, `directory`, `absent`, `touch` or `link`, `src` for links, `mode`, `owner`, `group`, `recurse`. |
| `lineinfile` | `line`, `regexp`, `search_string`, `insertafter`, `insertbefore`, `backrefs`, `firstmatch`, `create`, `state`, `backup`. Regular expressions are Go's, which take the usual syntax but not look-arounds or back-references in the pattern. |
| `apt`, `yum`, `dnf`, `package` | `name` (one or a list), `state` `present`, `latest` or `absent`, `update_cache`; `purge`, `autoremove` and `install_recommends` for `apt`. Changed only when a package version changed. |
| `service`, `systemd` | `state` `started`, `stopped`, `restarted` or `reloaded`, `enabled`, and `daemon_reload` for `systemd`. |
| `user`, `group` | `user`: `uid`, `group`, `groups` with `append`, `shell`, `home`, `create_home`, `system`, `comment`, `password` (a hash), `remove`. `group`: `gid`, `system`. |
| `get_url` | `url`, `dest`, `mode`, `owner`, `group`, `force`, `checksum` (`sha256:` only), `timeout`, `headers`. Downloaded on the asset with `curl` or `wget`. |
| `debug`, `set_fact`, `assert`, `fail`, `ping` | |

Keywords: `name`, `hosts`, `vars`, `become`, `become_user`, `gather_facts`, `pre_tasks`, `tasks`, `post_tasks`, `handlers` with `listen`, `notify`, `when`, `register`, `loop` and `with_items` with `loop_control` (`loop_var`, `index_var`, `label`), `ignore_errors`, `changed_when`, `failed_when`, `check_mode`, `no_log`, `environment` and `args`. `tags` are accepted and ignored: every task runs.

Templates and conditions are the common part of Jinja2: `{{ }}` with variables, attributes and indexes, `default`, `lower`, `upper`, `trim`, `int`, `float`, `string`, `bool`, `length`, `join`, `first`, `last`, `quote`, `replace`, `unique` and `sort` filters, the `defined`, `undefined`, `none`, `succeeded`, `failed`, `changed` and `skipped` tests, `and`, `or`, `not`, `in`, comparisons, arithmetic, `~` and inline `if`/`else`. A value that is only `{{ }}` keeps its type, as in Ansible.

Not supported, and reported before the playbook runs: roles, `include_*` and `import_*`, `block`, `vars_files`, `delegate_to`, `run_once`, `until` and retries, `async`, lookups and other function calls, Jinja2 statements (`{% %}`), other modules (including the Windows `win_*` ones and collections), and Windows assets. Variables from other hosts (`hostvars`) are not available, since each asset runs on its own.

### Results

For each asset, the job's page shows the tasks with their play, module, result (**ok**, **changed**, **failed**, **failed, ignored** or **skipped**), message, return code and output, and the items of loops, next to the output that `ansible-playbook` would print, ending with the PLAY RECAP. An asset succeeds when no task failed without its errors being ignored, and its exit code is then 0, or 2 otherwise.

Each task is recorded as a [command record](../audit/commands.md): the command for `command`, `shell` and `raw`, the module with its options for the others, such as `apt: name=nginx state=present`, and a script's file name with its content. They are checked against the command rules before they run: a Block rule stops the asset there as *Blocked*, and a Review rule waits for another administrator to approve the task. The commands that modules run on the asset are checked too, and recorded when a rule matches them, so a rule that blocks `/etc/shadow` also stops a `lineinfile` on it.

## Following a job

The list shows each job's name, type, status, how many of its assets succeeded and failed, who started it, when, and how long it took. Its page shows, for each asset, the status, the exit code, how long it took, the error and the output, which is updated every few seconds while it runs. Up to the last 1 MB of output is kept per asset.

| Status | Meaning |
| --- | --- |
| Pending | Not started yet, waiting for a free slot. |
| Running | Running now. |
| Succeeded | Exit code 0, or the file was written. |
| Failed | Another exit code, or an error such as a failed login. |
| Timed out | Stopped at the timeout. |
| Blocked | Stopped by a [command rule](../audit/commands.md) before it ran. |
| Canceled | Stopped by **Cancel job**, or not reached before it. |
| Interrupted | Casvisor was restarted while it ran. |

A job is *Succeeded* when every asset succeeded, and *Failed* otherwise.

On a job's page:

- **Cancel job** stops what is running and skips the assets not reached yet.
- **Rerun failed** runs the job again, in place, on the assets that did not succeed.
- **Run as new job** opens a new job with the same settings, to change and run.

A job can be deleted once it is not running, with its results and its uploaded file. A file uploaded for a job that was never started is removed when Casvisor starts, once it is a day old.

## Job schedules

A job can also run on a schedule, such as a backup every night or a check every hour. **Job schedules** (`/job-schedules`) lists them; create one with **New schedule** there, or with **Run on a schedule** on the new job page, which takes what is in the form.

A schedule has everything a job has, plus:

| Field | Meaning |
| --- | --- |
| Schedule | A cron expression of five fields: minute, hour, day of month, month and day of week. `0 3 * * *` is 03:00 every day, `*/15 9-18 * * 1-5` every 15 minutes in working hours, `0 2 * * SUN` 02:00 on Sundays; `@hourly`, `@daily`, `@weekly` and `@monthly` work too. The form shows the next five runs. When both the day of month and the day of week are given, either one matching is enough, as in cron. |
| Time zone | The time zone the schedule is read in, such as `Asia/Shanghai`; the server's when empty. |
| Enabled | Off keeps the schedule without running it. |

A playbook schedule keeps its attached files, and each job gets copies of them.

At each matching minute, Casvisor starts an ordinary job, named after the schedule, which shows on the Jobs page with a link back to its schedule; **Runs** on a schedule lists its jobs. **Run now** starts one at once. A run is skipped, and the schedule says so, while the last job of the schedule is still running. Runs missed while Casvisor was down are not made up.

Webhooks (the **Webhooks** page) can tell a chat group or your own system how jobs end: `job.succeeded`, `job.failed` with the assets that failed and why, and `job_schedule.missed` when a schedule's time came and no job started. Pick them in the webhook's events.

The jobs run as the administrator who last saved the schedule: the command rules for that administrator apply, and the jobs are recorded under that name. A file schedule keeps its file, and each job gets a copy of it, so deleting old jobs does not take the file away from the schedule.

## Rules, sessions and logs

- Before a command or script runs on an asset, each of its lines is checked against the [command rules](../audit/commands.md) that apply to the administrator who started the job and to that asset. A Block rule marks the asset *Blocked* and nothing is run there; a Review rule waits for another administrator to approve it; an Alert rule lets it run and flags it. Playbooks are checked task by task, see [Results](#results).
- The command or script is recorded as one [command record](../audit/commands.md) for each asset. A file transfer is recorded as `sftp put <file> <target path>`.
- Each asset's run is a [session](../audit/sessions.md) of its own, with the mode `job` and the user agent `Casvisor job`, and stopping that session stops the job on that asset. Its output is kept as a terminal [recording](../audit/recordings.md) of the session, played back like an SSH session.
- Starting, rerunning, cancelling and deleting jobs go into the [operation log](../audit/operation-logs.md), as `start-job`, `rerun-job`, `cancel-job` and `delete-job`.

Jobs are run by administrators and are not subject to [permissions](../access-control/permissions.md). For installing system updates, use [Patch management](./patches.md), which knows about Windows Update and the Linux package managers.
