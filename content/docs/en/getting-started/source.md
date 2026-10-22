---
title: "Run from source"
description: "Build Casvisor's Go backend and React web UI from the repository, with MySQL for the database and guacd for Telnet."
---

Running from source is how you develop Casvisor. To run it without Docker, you can also download a ready-built archive for your system from [GitHub Releases](https://github.com/casvisor/casvisor/releases) and use the configuration below.

## What you need

| | Version | What for |
| --- | --- | --- |
| Go | 1.26 or later | The backend |
| Node.js and Yarn | Node 20 or later, Yarn 1 | The web UI |
| MySQL or MariaDB | 5.7 / 10.3 or later | Assets, permissions, sessions, operation log |
| guacd | 1.5 or later | Telnet only; SSH, RDP and VNC do not need it |
| Casdoor | | Sign-in, see [Connect Casdoor](./casdoor.md) |

## Build and run

```bash
git clone https://github.com/casvisor/casvisor
cd casvisor/web
yarn install
yarn build
cd ..
go run .
```

`yarn build` writes the web UI to `web/build`, which the backend serves. Casvisor listens on port 19000 (`httpport` in `conf/app.conf`). On first start it creates the database named by `dbName` and its tables, so the MySQL account in `dataSourceName` needs the right to create a database.

Start guacd if you need Telnet:

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
```

## Configure

Edit `conf/app.conf` before the first start:

```ini
dataSourceName = root:123456@tcp(localhost:3306)/
dbName = casvisor
guacamoleEndpoint = 127.0.0.1:4822
casdoorEndpoint = https://door.example.com
clientId = <client ID>
clientSecret = <client secret>
casdoorOrganization = "<organization>"
casdoorApplication = "<application>"
```

[Configuration](../operations/configuration.md) explains each key.

## Working on the web UI

The web UI is React with Vite and shadcn/ui. For development, run Vite on its own and let it send API calls to the backend:

```bash
cd web
yarn dev
```

It serves on port 18001 and forwards `/api`, WebSockets included, to `http://localhost:19000`. Set `CASVISOR_BACKEND` to point it at another backend.

## Building for other systems

The backend is pure Go with `CGO_ENABLED=0`, so one machine can build for the others:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o casvisor .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o casvisor.exe .
```

Copy the binary together with `conf/`, `data/`, `swagger/` and `web/build/`, which it reads at run time from its working directory.
