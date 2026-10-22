---
title: "Quick start with Docker"
description: "Run Casvisor with one docker run: SQLite and its own accounts out of the box, the administrator password in the log, then add a server and connect."
---

Casvisor runs on its own out of the box: the database is SQLite, and when no Casdoor is configured it keeps its own user accounts. One container is enough to try it.

## 1. Start Casvisor

```bash
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -v casvisor-db:/db -v casvisor-recordings:/recordings \
  casbin/casvisor
```

- Port 19000 is the web UI and the API. Port 2222 is the [SSH gateway](../assets/ssh-gateway.md), for connecting with your own `ssh`, `scp` and VS Code; leave out `-p 2222:2222` if you do not need it.
- The `casvisor-db` volume keeps the SQLite database, and `casvisor-recordings` the [session recordings](../audit/recordings.md), when the container is replaced. The image runs as UID 1000, so if you mount host directories instead of named volumes, make them writable for that user.

## 2. Find the administrator password

On first start, with no users yet, Casvisor creates the administrator `admin` with a random password and prints it in its log:

```bash
docker logs casvisor
```

```text
========================================================================
Casvisor created the administrator "admin" with the password: 7kQm2xT9wRp4ZbNa , sign in and change it in My Account
========================================================================
```

To choose the first password yourself, add `-e adminPassword=<password>` to the `docker run` command, with at least 8 characters. It is only used when the first account is created; later changes go through **My Account**.

## 3. Sign in

Open `http://<your-ip>:19000` and sign in as `admin` with that password. Then open **My Account** in the menu at the top right and change the password.

## 4. Add a server and connect

1. Go to **Assets**, click **Add**, and fill in the protocol, host, port and, if you like, the account to log in with. See [Assets](../assets/assets.md).
2. Click **Connect** on the asset. A new tab opens with the terminal or desktop.

As an administrator you can reach every asset. To let other people in, add them under **Users** (see [Users and administrators](../access-control/users-and-admins.md)) and give them a [permission](../access-control/permissions.md). Every session is recorded; replay it from **Sessions**.

## With Docker Compose

The repository's [docker-compose.yml](https://github.com/casvisor/casvisor/blob/master/docker-compose.yml) does the same: it publishes 19000 and 2222, keeps the database in a volume, and has an `adminPassword` entry for the first password.

## With MySQL

SQLite is enough for a single Casvisor. To keep the data in MySQL or MariaDB instead, pass the database settings as environment variables:

```bash
docker run -d --name casvisor -p 19000:19000 -p 2222:2222 \
  -e driverName=mysql \
  -e dataSourceName='casvisor:secret@tcp(192.168.1.30:3306)/' \
  -e dbName=casvisor \
  -v casvisor-recordings:/recordings \
  casbin/casvisor
```

Casvisor creates the database and its tables on first start, so the account needs the right to create a database. See [Configuration](../operations/configuration.md#database).

The image `casbin/casvisor-all-in-one` carries its own MariaDB and is set up to use it, so it runs on its own as well. It keeps the database in `/var/lib/mysql`; mount a volume there (`-v casvisor-db:/var/lib/mysql`) or the data goes with the container.

## Sign in with Casdoor

Instead of its own accounts, Casvisor can sign people in through [Casdoor](https://casdoor.ai), for single sign-on, MFA, LDAP, SAML and social logins, and use Casdoor's groups in permissions. Setting `casdoorEndpoint` switches it over. See [Connect Casdoor](./casdoor.md).
