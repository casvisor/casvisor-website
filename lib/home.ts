import { KeyRound, MonitorPlay, Package, ScrollText, ShieldCheck, UserRoundCheck } from 'lucide-react';

// The landing page's copy, shared by the page, its metadata and its preview image.
const text = {
  en: {
    seoTitle: 'Casvisor: Open-Source Bastion Host for SSH, RDP, VNC and Telnet',
    badge: 'Apache-2.0, no enterprise edition',
    title: 'The open-source bastion host',
    subtitle: 'SSH, RDP, VNC and Telnet in the browser, every session checked and recorded.',
    lead: "Casvisor sits between your people and your servers. They sign in, with Casvisor's own accounts or your single sign-on through Casdoor, see only the machines they are allowed to reach, and connect from a browser tab without ever seeing a password. Every connection is checked against your policy and recorded.",
    start: 'Get started',
    copy: 'Copy command',
    installNote: 'Runs on SQLite with its own accounts. Sign in as admin with the password from docker logs casvisor.',
    howTitle: 'How a connection goes through',
    how: {
      people: 'People',
      peopleBody: 'Any browser, nothing to install',
      steps: ['Sign in, or single sign-on through Casdoor', 'Check the permission in Casbin', 'Open the session and record it'],
      native: 'Native in Go',
      servers: 'Servers',
      serversBody: 'Linux, Windows, network gear',
    },
    featuresTitle: 'What it does today',
    features: [
      {
        icon: MonitorPlay,
        title: 'Every protocol in a browser tab',
        body: 'SSH, RDP, VNC and Telnet all connect natively in Go, RDP with the clipboard, file transfer and the graphics pipeline. Users keep several machines open side by side in the workbench, or reach SSH assets with their own ssh, scp and VS Code through the SSH gateway.',
        href: 'assets/protocols',
      },
      {
        icon: KeyRound,
        title: 'Passwords stay on the server',
        body: 'Casvisor fills in the password or SSH key when it opens the connection, stores them encrypted, and the API only ever returns them masked. Or leave the account empty and let each user type their own.',
        href: 'assets/assets',
      },
      {
        icon: ShieldCheck,
        title: 'Permissions written in Casbin',
        body: 'Grant users or groups access to assets or asset tags, per action, from given IP ranges and inside a time window. Checked again on every connection, and open sessions are cut off when it is revoked.',
        href: 'access-control/permissions',
      },
      {
        icon: UserRoundCheck,
        title: 'Its own accounts, or Casdoor',
        body: 'Built-in accounts and groups out of the box. Connect Casdoor and users, groups, MFA, LDAP, OAuth and SAML come from there instead, with no second password database to look after.',
        href: 'access-control/users-and-admins',
      },
      {
        icon: ScrollText,
        title: 'Every session recorded',
        body: 'SSH, Telnet, VNC and RDP sessions recorded and replayed in the browser, and watched live. Commands kept and checked against rules, files moved and every write to the API in the operation log.',
        href: 'audit/recordings',
      },
      {
        icon: Package,
        title: 'One Go binary, or one container',
        body: 'Pure Go without cgo, released for Linux, Windows and macOS on amd64 and arm64. SQLite by default, so one docker run is all it takes.',
        href: 'getting-started/quickstart',
      },
    ],
    more: 'Read more',
    openTitle: 'Open source, all of it',
    open: [
      {
        title: 'Nothing held back',
        body: 'No paid build with the RDP connector, the database proxy or access requests locked away. What is in the repository is the product.',
      },
      {
        title: 'Uses what you already run',
        body: 'Policy from Casbin, and identity from Casdoor if you run it. No second user directory to keep in sync with the first.',
      },
      {
        title: 'Built in the open',
        body: 'Several system accounts with password rotation, access requests, and database access are next.',
      },
    ],
    roadmap: 'See the roadmap',
  },
  zh: {
    seoTitle: 'Casvisor：开源堡垒机，支持SSH、RDP、VNC和Telnet',
    badge: 'Apache-2.0许可证，没有企业版',
    title: '开源堡垒机',
    subtitle: '在浏览器里连SSH、RDP、VNC和Telnet，每个会话都检查、都录像。',
    lead: 'Casvisor放在运维人员和服务器之间。用户用Casvisor自带的账号登录，或者通过Casdoor单点登录，只能看到自己有权访问的机器，在浏览器标签页里直接连上去，全程看不到密码。每次连接都按你的策略检查，并录像。',
    start: '开始使用',
    copy: '复制命令',
    installNote: '自带SQLite和账号。用docker logs casvisor里的密码以admin登录。',
    howTitle: '一次连接怎么走',
    how: {
      people: '用户',
      peopleBody: '任意浏览器，不用装客户端',
      steps: ['登录，或通过Casdoor单点登录', '用Casbin检查权限', '建立会话并录像'],
      native: 'Go原生实现',
      servers: '服务器',
      serversBody: 'Linux、Windows、网络设备',
    },
    featuresTitle: '现在能做什么',
    features: [
      {
        icon: MonitorPlay,
        title: '所有协议都在浏览器标签页里',
        body: 'SSH、RDP、VNC和Telnet都用Go原生连接，RDP支持剪贴板、文件传输和图形管道。在工作台里可以同时打开多台机器并排切换，SSH资产也能通过SSH网关用本地的ssh、scp和VS Code连接。',
        href: 'assets/protocols',
      },
      {
        icon: KeyRound,
        title: '密码留在服务器上',
        body: 'Casvisor在建立连接时替用户填入密码或SSH私钥，加密保存，接口返回的一律打码。也可以不填账号，让每个用户连接时自己输入。',
        href: 'assets/assets',
      },
      {
        icon: ShieldCheck,
        title: '用Casbin写的权限',
        body: '把资产或资产标签授权给用户或用户组，按动作、来源IP和有效期细分。每次连接都会重新检查，权限收回时在线会话立即断开。',
        href: 'access-control/permissions',
      },
      {
        icon: UserRoundCheck,
        title: '自带账号，也可以接Casdoor',
        body: '开箱即有内置账号和用户组。接上Casdoor后，用户、用户组、多因素认证、LDAP、OAuth和SAML都改由Casdoor提供，不用另外维护一套账号密码。',
        href: 'access-control/users-and-admins',
      },
      {
        icon: ScrollText,
        title: '每个会话都有录像',
        body: 'SSH、Telnet、VNC和RDP会话都会录像，在浏览器里回放，也能实时旁观。命令有记录、按规则拦截，传过的文件和对接口的每次写操作都记进操作日志。',
        href: 'audit/recordings',
      },
      {
        icon: Package,
        title: '一个Go程序，或者一个容器',
        body: '纯Go实现、不依赖cgo，提供Linux、Windows和macOS的amd64、arm64版本。默认用SQLite，一条docker run就能跑起来。',
        href: 'getting-started/quickstart',
      },
    ],
    more: '了解更多',
    openTitle: '完全开源',
    open: [
      {
        title: '没有阉割',
        body: '不会把RDP连接、数据库代理或访问申请放进收费版。仓库里有什么，产品就是什么。',
      },
      {
        title: '用你已经在用的系统',
        body: '策略来自Casbin，有Casdoor时身份也来自Casdoor。不用再维护一套要和现有目录同步的用户。',
      },
      {
        title: '公开开发',
        body: '接下来要做：一个资产多个系统账号与自动改密，访问审批，数据库访问。',
      },
    ],
    roadmap: '查看路线图',
  },
};

export function getText(lang: string) {
  return text[lang as keyof typeof text] ?? text.en;
}
