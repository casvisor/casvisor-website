---
title: "Quick start with Docker"
description: "Run Casvisor with the all-in-one Docker image, which carries its own MariaDB and guacd, sign in through Casdoor and connect to the first server."
---

The quickest way to try Casvisor is the all-in-one image `casbin/casvisor-all-in-one`. Besides Casvisor it carries MariaDB for the database and guacd for Telnet, so it runs on its own. The only thing it needs from outside is a Casdoor to sign in with.

## 1. Prepare Casdoor

Casvisor has no login of its own. Use image v1.110.0 or later: earlier ones cannot sign in with a Casdoor installed from v4.10 on (see [About the certificate](./casdoor.md#about-the-certificate)).

If you already run Casdoor, create an application for Casvisor as described in [Connect Casdoor](./casdoor.md) and come back with its client ID and secret.

If you do not, start one next to it:

```bash
docker run -d --name casdoor -p 8000:8000 casbin/casdoor-all-in-one
```

Open `http://<your-ip>:8000`, sign in as `admin` / `123`, change that password, and create the application as in [Connect Casdoor](./casdoor.md). Use the machine's IP address or host name rather than `localhost` throughout: Casvisor's container calls Casdoor at the same address your browser uses, and inside the container `localhost` is the container itself.

## 2. Write app.conf

Download the default configuration:

```bash
curl -fsSLo app.conf https://raw.githubusercontent.com/casvisor/casvisor/master/conf/app.conf
```

and change the five Casdoor keys to your own:

```ini
casdoorEndpoint = http://192.168.1.20:8000
clientId = <client ID of the application>
clientSecret = <client secret of the application>
casdoorOrganization = "<organization of the application>"
casdoorApplication = "<name of the application>"
```

Leave `dataSourceName` and `guacamoleEndpoint` as they are: they point at the MariaDB and guacd inside the image. [Configuration](../operations/configuration.md) lists every key.

## 3. Start Casvisor

```bash
docker run -d --name casvisor -p 19000:19000 \
  -v "$PWD/app.conf:/conf/app.conf" \
  -v casvisor-db:/var/lib/mysql \
  casbin/casvisor-all-in-one
```

The second volume keeps the database when the container is replaced. On first start Casvisor creates the `casvisor` database and its tables.

The [SSH gateway](../assets/ssh-gateway.md), for connecting with your own `ssh`, `scp` and VS Code, is on the master branch. Images from the release after v1.110.0 run it on port 2222; add `-p 2222:2222` to the command above to use it.

## 4. Sign in

Open `http://<your-ip>:19000`. You are sent to Casdoor and back. Sign in with an account that is an administrator of the application's organization (**Is admin** on the user in Casdoor) to see the management pages; other users only get the workbench.

If Casdoor says the redirect URI is not allowed, add `http://<your-ip>:19000/callback` to the application's **Redirect URLs**.

## 5. Add a server and connect

1. Go to **Assets**, click **Add**, and fill in the protocol, host, port and, if you like, the account to log in with. See [Assets](../assets/assets.md).
2. Click **Connect** on the asset. A new tab opens with the terminal or desktop.

As an administrator you can reach every asset. To let other people in, create a [permission](../access-control/permissions.md) that names them, or a Casdoor group they are in.

## Without the all-in-one image

`casbin/casvisor` is the same Casvisor without MariaDB and guacd. Use it when you already have a MySQL server, and run guacd beside it if you need Telnet:

```bash
docker run -d --name guacd -p 4822:4822 guacamole/guacd
docker run -d --name casvisor -p 19000:19000 -v "$PWD/app.conf:/conf/app.conf" casbin/casvisor
```

Then set `dataSourceName` to your MySQL server and `guacamoleEndpoint` to the guacd container, by an address the Casvisor container can reach. The repository's [docker-compose.yml](https://github.com/casvisor/casvisor/blob/master/docker-compose.yml) starts the three together.
