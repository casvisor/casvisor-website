---
title: "Upgrading"
description: "How Casvisor is released, which Docker tags to follow, what happens to the database when a new version starts, and what to check when upgrading a setup that used MySQL and Casdoor."
---

## Releases

Casvisor is released by pushing a version tag such as `v1.110.0`. Each release appears on [GitHub Releases](https://github.com/casvisor/casvisor/releases), with archives for Linux, Windows and macOS on amd64 and arm64 that carry the binary, `conf/`, `data/`, `swagger/` and `web/build/`, and as Docker images for amd64 and arm64:

| Image | Contents |
| --- | --- |
| `casbin/casvisor` | Casvisor, on SQLite unless configured otherwise |
| `casbin/casvisor-all-in-one` | Casvisor with its own MariaDB, set up to use it |

A tag such as `v1.2.3` publishes both images as `1.2.3`, `v1.2.3`, `1.2`, `1` and `latest`; a pre-release tag such as `v1.2.3-beta.1` only as `1.2.3-beta.1` and `v1.2.3-beta.1`. Pin a version in production and move it forward on purpose.

## Upgrading the Docker image

```bash
docker pull casbin/casvisor:<version>
docker rm -f casvisor
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -v casvisor-db:/db -v casvisor-recordings:/recordings \
  casbin/casvisor:<version>
```

Start the new container with the same volumes, ports and environment variables as the old one. The SQLite database is in the volume on `/db` and the recordings in the one on `/recordings`; with the all-in-one image the database is in `/var/lib/mysql` instead. Without those volumes, replacing the container loses them. Open sessions are cut off when the old container stops, and people sign in again if sessions are kept as files rather than in Redis.

## The database

At start, Casvisor creates any table or column the new version needs. It does not drop anything: tables and columns that a newer version no longer uses stay in the database, untouched. Back the database up before upgrading across many versions, so that you can go back.

## Upgrading from earlier versions

Casvisor changed a lot in October 2026, when it was narrowed down to a bastion host:

- **v1.107.0** removed the **Machines** and **Providers** pages, the cloud sync behind them, and writing logs to a blockchain. The old `machine` and `provider` tables stay in the database and can be dropped once you no longer need them. An asset now holds its own protocol, host, port and account, so assets made for the old machine-based connection have to be filled in again before they connect.
- **v1.109.0** added [permissions](../access-control/permissions.md). Users who are not administrators can reach nothing until permissions are created for them.
- **v1.110.0** fetches the Casdoor certificate at start, so it works with any Casdoor; adds `credentialKey` for encrypted credentials, SSH private keys, pinned host fingerprints and `allowedUsers`. Existing assets record their fingerprint on their next connection.

## Upgrading a setup with MySQL and Casdoor

Casvisor runs on SQLite with its own accounts unless told otherwise. When you upgrade a Casvisor that was set up with MySQL and Casdoor:

- **The database.** Keep `driverName = mysql`, with `dataSourceName` and `dbName`, in the `app.conf` you mount or as environment variables. Without them Casvisor starts on a new, empty SQLite database. The all-in-one image sets them for its MariaDB itself.
- **Sign-in.** With `casdoorEndpoint` set, nothing changes. A fresh copy of the default `app.conf` has it empty, which switches to the [built-in accounts](../access-control/users-and-admins.md); copy your Casdoor keys over.
- **Recordings.** Every session is now [recorded](../audit/recordings.md). In Docker, mount a volume on `/recordings` so that they survive the container, and set `recordingRetentionDays` if they should not be kept forever, or `disableRecording = true` to turn recording off.
