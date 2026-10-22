---
title: "Configuration"
description: "Every key of Casvisor's conf/app.conf: the HTTP port, SQLite or MySQL, built-in accounts or Casdoor, the SSH gateway, recordings, patch scans, sessions in Redis and the operation log."
---

Casvisor reads `conf/app.conf` from its working directory when it starts. In the Docker images that is `/conf/app.conf`. Restart Casvisor after changing it.

Two ways to keep your own values apart from the file in the repository:

- **`conf/app.local.conf`**, in the same format. Every key in it overrides `conf/app.conf`. It is not in git, so pulling a new version never conflicts with it; it is the place for `dataSourceName`, `clientSecret` and `credentialKey`.
- **Environment variables** of the same name as the key, which override both files, for example `docker run -e driverName=mysql ...`. This works for every key in the tables below except `httpport`, `runmode`, `redisEndpoint` and the Beego settings, which are read from the files only.

```ini
appname = casvisor
httpport = 19000
runmode = dev
SessionOn = true
copyrequestbody = true
driverName = sqlite
dataSourceName = db/casvisor.db
dbName =
tableNamePrefix =
isDemoMode = false
logPostOnly = true
redisEndpoint =
casdoorEndpoint =
clientId =
clientSecret =
casdoorOrganization = "casvisor"
casdoorApplication =
adminPassword =
sshGatewayPort =
sshGatewayHost =
recordingPath =
recordingRetentionDays =
disableRecording = false
```

With the file as shipped, Casvisor keeps its data in SQLite under `db/` and signs people in with its own accounts.

## Server

| Key | Default | Meaning |
| --- | --- | --- |
| `httpport` | `19000` | The port Casvisor listens on, for the web UI, the API and the connection WebSockets. |
| `runmode` | `dev` | Beego's run mode. `prod` turns off Beego's development error pages. |
| `appname`, `SessionOn`, `copyrequestbody` | | Beego settings Casvisor relies on. Leave them as they are. |

## Database

| Key | Default | Meaning |
| --- | --- | --- |
| `driverName` | `sqlite` | `sqlite`, or `mysql` for MySQL and MariaDB. |
| `dataSourceName` | `db/casvisor.db` | For SQLite, the database file, relative to the working directory (`/db/casvisor.db` in the Docker image); its folder is created if missing. For MySQL, the DSN up to and including the `/`, without the database name, such as `root:123456@tcp(localhost:3306)/`. |
| `dbName` | empty | MySQL only: the database. Casvisor creates it at start if it does not exist. |
| `tableNamePrefix` | empty | A prefix for the API rule table, for sharing a database. |

Casvisor creates its tables, and any column a newer version needs, at start. SQLite runs in WAL mode and waits up to 10 seconds for a lock, which is plenty for one Casvisor; use MySQL when the database should live on another server or be backed up with your other MySQL databases.

When the environment variable `RUNNING_IN_DOCKER` is `true`, `localhost` in `dataSourceName` is replaced by the Docker host's address, so a container can reach a MySQL server running on its host.

## Sign-in

| Key | Default | Meaning |
| --- | --- | --- |
| `casdoorEndpoint` | empty | Empty: Casvisor signs people in with its own accounts. Set to Casdoor's address, reachable from both the browsers and the Casvisor server and without a trailing slash, to sign in through Casdoor instead. |
| `clientId`, `clientSecret` | empty | The client ID and secret of the Casdoor application. |
| `casdoorOrganization` | `casvisor` | With Casdoor, the organization of the application. With built-in accounts, the organization those accounts, and the assets and permissions they create, belong to. |
| `casdoorApplication` | empty | The name of the Casdoor application. |
| `adminPassword` | empty | Built-in accounts only: the password of the first administrator, `admin`, created when there are no users yet. Empty means a random one, printed once in the log. It is not used after that. |
| `allowedUsers` | empty | Comma-separated `organization/name` of the only users who may sign in. Empty lets everyone in. See [Users and administrators](../access-control/users-and-admins.md#limiting-who-can-sign-in). |

See [Connect Casdoor](../getting-started/casdoor.md) and [Users and administrators](../access-control/users-and-admins.md). Casvisor writes the Casdoor values into the web UI when it serves it, and an empty `casdoorEndpoint` makes the UI show its own sign-in form, so the same build works either way.

## Connections

| Key | Default | Meaning |
| --- | --- | --- |
| `sshGatewayPort` | empty; `2222` in the Docker images | The port of the [SSH gateway](../assets/ssh-gateway.md), on every interface. Empty turns the gateway off. The Docker images set it with an environment variable, so pass `-e sshGatewayPort=` to turn it off there. It is always off with `isDemoMode = true`. |
| `sshGatewayHost` | empty | The host name shown in the SSH commands users copy. Empty uses the host name of the web UI. |

## Recordings

| Key | Default | Meaning |
| --- | --- | --- |
| `recordingPath` | empty | Where [recordings](../audit/recordings.md) are written. Empty means `recordings/` under the working directory, which is `/recordings` in the Docker image. |
| `recordingRetentionDays` | empty | Recordings older than this many days are deleted, checked every hour. Empty or `0` keeps them forever. |
| `disableRecording` | `false` | `true` stops recording new sessions. Recordings already made can still be played. |

## Patch management

| Key | Default | Meaning |
| --- | --- | --- |
| `patchScanInterval` | `24` | Hours after which an asset that was scanned before is [scanned for updates](../assets/patches.md) again by itself. `0` turns the scheduled scans off. |

## Sessions and logs

| Key | Default | Meaning |
| --- | --- | --- |
| `redisEndpoint` | empty | Empty keeps sign-in sessions as files under `tmp/`. Set it to a Redis address, such as `127.0.0.1:6379`, to keep them in Redis instead, so people stay signed in when the container is replaced. |
| `logPostOnly` | `true` | Log only the calls that change something. See [Operation logs](../audit/operation-logs.md). |
| `isDemoMode` | `false` | For a public demo: sessions end after 15 minutes, each client IP can have only a few open at a time, users can only stop their own sessions, the SSH gateway is off, and so are scheduled patch scans. |

## Security

| Key | Default | Meaning |
| --- | --- | --- |
| `credentialKey` | empty | Encrypts stored passwords and private keys. See [Encryption](../assets/assets.md#encryption). |
