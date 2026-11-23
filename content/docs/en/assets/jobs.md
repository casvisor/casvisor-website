---
title: "Jobs"
seoTitle: "Casvisor: run commands and scripts on many servers"
description: "Jobs run a command, a Bash or PowerShell script, or a file transfer on many SSH assets at once, picked by name or by tag, with a timeout and a concurrency limit. Output and exit codes are kept per asset, command rules apply, and each asset's run is a session."
---

**Jobs** (`/jobs`) run the same thing on many servers at once: a command, a script, or a file to copy onto them. They work on SSH assets, Linux and Windows, over the account stored on the asset, with nothing installed on the servers. The page is for administrators.

## Starting a job

**New job** asks for:

| Field | Meaning |
| --- | --- |
| Name | Optional, such as *Check disk space*, to find the job in the list. |
| Type | **Command**, **Script** or **File transfer**. |
| Assets, Asset tags | The assets to run on, by name, and every SSH asset that has one of the tags when the job starts. Only SSH assets can run jobs; assets of other protocols with a tag are left out. The form shows the assets the job will run on. |
| Command | For a command: one command line. |
| Script type, Script | For a script: **Bash** or **PowerShell**, and the script. |
| File, Target path | For a file transfer: the file, uploaded to Casvisor first, up to 1 GB, and where to put it. |
| Timeout (seconds) | How long each asset may take, 60 by default and at most a day. An asset still running after it is stopped. |
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

At each matching minute, Casvisor starts an ordinary job, named after the schedule, which shows on the Jobs page with a link back to its schedule; **Runs** on a schedule lists its jobs. **Run now** starts one at once. A run is skipped, and the schedule says so, while the last job of the schedule is still running. Runs missed while Casvisor was down are not made up.

Webhooks (the **Webhooks** page) can tell a chat group or your own system how jobs end: `job.succeeded`, `job.failed` with the assets that failed and why, and `job_schedule.missed` when a schedule's time came and no job started. Pick them in the webhook's events.

The jobs run as the administrator who last saved the schedule: the command rules for that administrator apply, and the jobs are recorded under that name. A file schedule keeps its file, and each job gets a copy of it, so deleting old jobs does not take the file away from the schedule.

## Rules, sessions and logs

- Before a command or script runs on an asset, each of its lines is checked against the [command rules](../audit/commands.md) that apply to the administrator who started the job and to that asset. A Block rule marks the asset *Blocked* and nothing is run there; an Alert rule lets it run and flags it.
- The command or script is recorded as one [command record](../audit/commands.md) for each asset. A file transfer is recorded as `sftp put <file> <target path>`.
- Each asset's run is a [session](../audit/sessions.md) of its own, with the mode `job` and the user agent `Casvisor job`, and stopping that session stops the job on that asset. Jobs have no [recordings](../audit/recordings.md); their output is on the job's page.
- Starting, rerunning, cancelling and deleting jobs go into the [operation log](../audit/operation-logs.md), as `start-job`, `rerun-job`, `cancel-job` and `delete-job`.

Jobs are run by administrators and are not subject to [permissions](../access-control/permissions.md). For installing system updates, use [Patch management](./patches.md), which knows about Windows Update and the Linux package managers.
