---
title: "Upgrading"
description: "How Casvisor is released, which Docker tags to follow, and what happens to the database when a new version starts."
---

## Releases

Casvisor is released by pushing a version tag such as `v1.110.0`. Each release appears on [GitHub Releases](https://github.com/casvisor/casvisor/releases), with archives for Linux, Windows and macOS on amd64 and arm64 that carry the binary, `conf/`, `data/`, `swagger/` and `web/build/`, and as Docker images for amd64 and arm64:

| Image | Contents |
| --- | --- |
| `casbin/casvisor` | Casvisor alone |
| `casbin/casvisor-all-in-one` | Casvisor with MariaDB and guacd |

Both are tagged with the version, for example `v1.110.0`, and `latest` follows the newest release. Pin a version in production and move it forward on purpose.

## Upgrading the Docker image

```bash
docker pull casbin/casvisor-all-in-one:<version>
docker rm -f casvisor
docker run -d --name casvisor -p 19000:19000 \
  -v "$PWD/app.conf:/conf/app.conf" \
  -v casvisor-db:/var/lib/mysql \
  casbin/casvisor-all-in-one:<version>
```

With the all-in-one image the database is inside the `casvisor-db` volume; without that volume, replacing the container loses it. Open sessions are cut off when the old container stops, and people sign in again if sessions are kept as files rather than in Redis.

## The database

At start, Casvisor creates any table or column the new version needs. It does not drop anything: tables and columns that a newer version no longer uses stay in the database, untouched. Back the database up before upgrading across many versions, so that you can go back.

## Upgrading from earlier versions

Casvisor changed a lot in October 2026, when it was narrowed down to a bastion host:

- **v1.107.0** removed the **Machines** and **Providers** pages, the cloud sync behind them, and writing logs to a blockchain. The old `machine` and `provider` tables stay in the database and can be dropped once you no longer need them. An asset now holds its own protocol, host, port and account, so assets made for the old machine-based connection have to be filled in again before they connect.
- **v1.108.0** connects SSH and VNC natively instead of through guacd.
- **v1.109.0** added [permissions](../access-control/permissions.md). Users who are not administrators can reach nothing until permissions are created for them.
- **v1.110.0** connects RDP natively as well, so guacd is only needed for Telnet; fetches the Casdoor certificate at start, so it works with any Casdoor; adds `credentialKey` for encrypted credentials, SSH private keys, pinned host fingerprints and `allowedUsers`. Existing assets record their fingerprint on their next connection.
