---
title: "Cloud accounts"
seoTitle: "Casvisor: sync the servers of Alibaba Cloud, AWS, Tencent Cloud, Azure and Google Cloud as assets"
description: "Add an account of Alibaba Cloud, AWS, Tencent Cloud, Azure or Google Cloud, and Casvisor turns its servers into assets: Linux servers as SSH assets, Windows servers as RDP assets, in a node per region of the asset tree. A preview shows what a sync changes, and syncs can run on a schedule."
---

Instead of adding cloud servers one by one, add the cloud account they are in. Casvisor lists the servers of the account through the provider's API and keeps an asset for each: new servers become new assets, and the address, display name and OS of the assets follow their servers. The page is for administrators: **Cloud accounts** (`/cloud-accounts`).

Casvisor only reads the list of servers, so a read-only key is enough:

| Provider | Credentials | Enough permission |
| --- | --- | --- |
| Alibaba Cloud | AccessKey ID and secret of a RAM user | `AliyunECSReadOnlyAccess` |
| AWS | Access key ID and secret access key of an IAM user | `AmazonEC2ReadOnlyAccess` |
| Tencent Cloud | SecretId and SecretKey of a CAM user | `QcloudCVMReadOnlyAccess` |
| Azure | Tenant ID, subscription ID, and the client ID and client secret of a service principal | The Reader role on the subscription |
| Google Cloud | The JSON key of a service account; the project is the key's unless another is given | The Compute Viewer role on the project |

The secret is stored encrypted, like the passwords of assets, and the page shows it as `***`.

## Fields

| Field | Meaning |
| --- | --- |
| Provider | Alibaba Cloud, AWS, Tencent Cloud, Azure or Google Cloud. |
| Credentials | As in the table above. |
| Regions | Only the servers in these regions are synced; all regions when empty. **Load regions** lists the regions of the account, which also tells whether the credentials work. |
| Address | The public IP of the servers, or their private IP when they have none; or the private IP first. Use the private IP when Casvisor, or the network gateway below, is in the same network as the servers. |
| Linux username, Windows username | The user new assets connect as. Linux servers become SSH assets on port 22, Windows servers RDP assets on port 3389. |
| Asset tree node | New assets go under this node of the asset tree, in a node per region, which are created when missing, for example `Cloud/Alibaba Cloud/cn-beijing`. When empty, new assets go in no node. |
| Tag, Network gateway | What new assets get. A [network gateway](./network-gateways.md) reaches servers in a private network. |
| Sync interval | In minutes, at least 5. `0` syncs only when **Sync** is clicked. |
| Delete missing assets | Delete the assets whose servers are no longer in the account. When off, they are only reported as missing. |
| Enabled | Off stops the scheduled syncs. |

## Syncing

**Sync**, on the list or the edit page, first shows a preview: for each server whether its asset is created, updated or left as it is, and why a row fails. **Sync now** then applies it. A scheduled sync applies it directly, and the list shows the time and the outcome of the last sync of each account.

What a sync does:

- **A new server** becomes an asset named after the server. When the name is taken by another asset, the end of the server's ID is added, such as `web-01-3f9c2a1b`. The asset gets no password or key: set them on the asset or on its [system accounts](./accounts.md).
- **A synced asset** gets the display name, the address, the OS and the description of its server. Everything else you change on the asset stays, such as its protocol, port, username, nodes and permissions. The asset page shows which cloud account and server it is synced from.
- **An address that changed** is not applied to an asset that keeps a saved password or private key: those are only used for the address they were saved for, so that a change in the cloud account can't send them to another host. The row fails and says so; enter the password again, or clear it, and sync again.
- **A server that is gone** leaves its asset reported as missing, or deleted when **Delete missing assets** is on. When the account lists no servers at all, nothing is deleted.

Renaming a cloud account keeps its assets synced. Deleting it keeps the assets, which are then no longer synced.
