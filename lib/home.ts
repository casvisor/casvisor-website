import { KeyRound, MonitorPlay, Package, ScrollText, ShieldCheck, UserRoundCheck } from 'lucide-react';

// The landing page's copy, shared by the page, its metadata and its preview image.
const text = {
  en: {
    seoTitle: 'Casvisor: Open-Source Bastion Host for SSH, RDP, VNC and Telnet',
    badge: 'Apache-2.0, no enterprise edition',
    title: 'The open-source bastion host',
    subtitle: 'SSH, RDP, VNC and Telnet in the browser, behind your single sign-on.',
    lead: 'Casvisor sits between your people and your servers. They sign in once through Casdoor, see only the machines they are allowed to reach, and connect from a browser tab without ever seeing a password. Every connection is checked against your policy and kept on record.',
    start: 'Get started',
    copy: 'Copy command',
    installNote: 'The all-in-one image brings its own MariaDB and guacd. Point app.conf at your Casdoor first.',
    howTitle: 'How a connection goes through',
    how: {
      people: 'People',
      peopleBody: 'Any browser, nothing to install',
      steps: ['Sign in with Casdoor', 'Check the permission in Casbin', 'Open the session and log it'],
      native: 'Native in Go',
      guacd: 'Through guacd',
      servers: 'Servers',
      serversBody: 'Linux, Windows, network gear',
    },
    featuresTitle: 'What it does today',
    features: [
      {
        icon: MonitorPlay,
        title: 'Every protocol in a browser tab',
        body: 'SSH, RDP and VNC connect natively in Go; only Telnet goes through guacd. Users keep several machines open side by side in the workbench.',
        href: 'assets/protocols',
      },
      {
        icon: KeyRound,
        title: 'Passwords stay on the server',
        body: 'Casvisor fills in the account when it opens the connection, and the API only ever returns passwords masked. Or leave the account empty and let each user type their own.',
        href: 'assets/assets',
      },
      {
        icon: ShieldCheck,
        title: 'Permissions written in Casbin',
        body: 'Grant users or Casdoor groups access to assets or asset tags, per action, from given IP ranges and inside a time window. Checked again on every connection.',
        href: 'access-control/permissions',
      },
      {
        icon: UserRoundCheck,
        title: 'Single sign-on through Casdoor',
        body: 'Users, groups, MFA, LDAP, OAuth and SAML all come from Casdoor. Casvisor keeps no second password database to look after.',
        href: 'getting-started/casdoor',
      },
      {
        icon: ScrollText,
        title: 'Every session and every change on record',
        body: 'Live and past sessions with who, from where and for how long, and a button to cut one off. Every write to the API goes into the operation log.',
        href: 'audit/sessions',
      },
      {
        icon: Package,
        title: 'One Go binary, or one container',
        body: 'Pure Go without cgo, so it builds for Linux, Windows and macOS. The all-in-one Docker image runs with nothing else beside it.',
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
        body: 'Identity from Casdoor, policy from Casbin. No second user directory to keep in sync with the first.',
      },
      {
        title: 'Built in the open',
        body: 'Connections from native ssh and scp clients, an encrypted credential vault and session playback are next.',
      },
    ],
    roadmap: 'See the roadmap',
  },
  zh: {
    seoTitle: 'Casvisor：开源堡垒机，支持SSH、RDP、VNC和Telnet',
    badge: 'Apache-2.0许可证，没有企业版',
    title: '开源堡垒机',
    subtitle: '在浏览器里连SSH、RDP、VNC和Telnet，统一单点登录。',
    lead: 'Casvisor放在运维人员和服务器之间。用户通过Casdoor登录一次，只能看到自己有权访问的机器，在浏览器标签页里直接连上去，全程看不到密码。每次连接都按你的策略检查，并留下记录。',
    start: '开始使用',
    copy: '复制命令',
    installNote: 'all-in-one镜像自带MariaDB和guacd。启动前先在app.conf里填好你的Casdoor。',
    howTitle: '一次连接怎么走',
    how: {
      people: '用户',
      peopleBody: '任意浏览器，不用装客户端',
      steps: ['用Casdoor登录', '用Casbin检查权限', '建立会话并记录'],
      native: 'Go原生实现',
      guacd: '经由guacd',
      servers: '服务器',
      serversBody: 'Linux、Windows、网络设备',
    },
    featuresTitle: '现在能做什么',
    features: [
      {
        icon: MonitorPlay,
        title: '所有协议都在浏览器标签页里',
        body: 'SSH、RDP和VNC用Go原生连接，只有Telnet经由guacd。在工作台里可以同时打开多台机器，并排切换。',
        href: 'assets/protocols',
      },
      {
        icon: KeyRound,
        title: '密码留在服务器上',
        body: 'Casvisor在建立连接时替用户填入账号，接口返回的密码一律打码。也可以不填账号，让每个用户连接时自己输入。',
        href: 'assets/assets',
      },
      {
        icon: ShieldCheck,
        title: '用Casbin写的权限',
        body: '把资产或资产标签授权给用户或Casdoor用户组，按动作、来源IP和有效期细分。每次连接都会重新检查。',
        href: 'access-control/permissions',
      },
      {
        icon: UserRoundCheck,
        title: '通过Casdoor单点登录',
        body: '用户、用户组、多因素认证、LDAP、OAuth和SAML都来自Casdoor。Casvisor不另外维护一套账号密码。',
        href: 'getting-started/casdoor',
      },
      {
        icon: ScrollText,
        title: '每个会话、每次改动都有记录',
        body: '在线和历史会话：谁、从哪里、连了多久，管理员可以一键断开。对接口的每次写操作都记进操作日志。',
        href: 'audit/sessions',
      },
      {
        icon: Package,
        title: '一个Go程序，或者一个容器',
        body: '纯Go实现、不依赖cgo，可以编译到Linux、Windows和macOS。all-in-one Docker镜像不需要再装别的东西。',
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
        body: '身份来自Casdoor，策略来自Casbin。不用再维护一套要和现有目录同步的用户。',
      },
      {
        title: '公开开发',
        body: '接下来要做：用本地ssh、scp客户端直连，加密的凭据保险箱，会话录像回放。',
      },
    ],
    roadmap: '查看路线图',
  },
};

export function getText(lang: string) {
  return text[lang as keyof typeof text] ?? text.en;
}
