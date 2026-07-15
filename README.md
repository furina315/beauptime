# BeaUptime - Open-Source Uptime Monitoring (Cloudflare)

[中文说明](#中文说明) | [English](#english)

---

## <a id="english"></a> English

BeaUptime is an open-source uptime monitoring system designed to run entirely on Cloudflare's free plan. It gives you scheduled checks, incident tracking, a public status page, and a private admin dashboard without paying for servers or a separate monitoring service.

It is self-hosted, deployed as a single Cloudflare Worker, and uses Cloudflare Workers, D1, Cron Triggers, and optional Email Routing / custom SMTP / Apprise.

### 🌟 Features
- **Public status page** at `/status`
- **Password-only admin access** for a single operator
- **Private dashboard** for services, incidents, and dynamic settings
- **SMTP & Apprise Support**: Configure your own SMTP server or Apprise hook directly from the dashboard UI to receive downtime alerts.
- **HTTP/TCP Checks**: Monitor both HTTP endpoints and TCP ports.
- **Managed storage** with Cloudflare D1.

### 🚀 Deploy to Cloudflare (via GitHub)

You can push this repository directly to GitHub and deploy it to Cloudflare. 

**Prerequisites on Cloudflare Dashboard:**
1. Create a **D1 Database** in your Cloudflare dashboard (e.g., named `bea-uptime`).
2. Note down the Database ID (UUID).
3. Replace the `database_id` inside `wrangler.jsonc` with your real UUID, or configure the binding in the Cloudflare Dashboard.

**Direct Cloudflare Git Integration:**
1. Go to Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Workers** -> **Connect to Git**.
2. Select your pushed repository.
3. **Build settings**:
   - **Build command**: `bun run build` (or `npm run build` if you replace the package.json scripts)
   - **Deploy command**: `npx wrangler deploy`
4. **Environment Variables (Secrets)**:
   - `AUTH_ROOT_SECRET`: Your admin password to log in to the dashboard (Required).
   - *Note: Other variables like SMTP and Apprise are now configured directly within the Dashboard Settings UI.*

**Database Auto-Initialization**:
You **no longer need to manually run migrations**. The system will automatically create the required database tables the first time it receives a request (e.g. when you visit the dashboard).


---

## <a id="中文说明"></a> 中文说明

BeaUptime 是一个开源的在线状态监控系统，专为完全在 Cloudflare 免费计划上运行而设计。它为您提供定时检查、故障事件跟踪、公共状态页面以及私人管理仪表盘，而无需租用服务器或支付单独的监控服务费用。

它是自托管的，作为一个单一的 Cloudflare Worker 部署，并使用 Cloudflare Workers, D1 数据库, Cron 定时触发器，以及可选的 Email Routing / 自定义 SMTP / Apprise 消息推送。

### 🌟 特性
- `/status` 的**公共状态页面**
- 仅限密码的**单用户管理员仪表盘**
- 用于管理服务、事件和动态设置的**私有管理后台**
- **SMTP 与 Apprise 支持**：您可以直接在仪表盘的设置界面中配置您自己的 SMTP 服务器或 Apprise Webhook，用于接收宕机报警。
- **HTTP/TCP 检查**：支持监控 HTTP 接口和 TCP 端口。
- 基于 Cloudflare D1 的完全托管存储。

### 🚀 部署到 Cloudflare (通过 GitHub)

您可以将此代码库直接推送到 GitHub，并在 Cloudflare 中一键导入部署。

**在 Cloudflare 控制台的前置准备：**
1. 在 Cloudflare 控制台中创建一个 **D1 数据库**（例如命名为 `bea-uptime`）。
2. 记下该数据库的 ID (UUID)。
3. 将 `wrangler.jsonc` 中的 `database_id` 替换为您真实的 UUID，或者在 Cloudflare 控制台的绑定中配置。

**在 Cloudflare 直接导入部署：**
1. 进入 Cloudflare 控制台 -> **Workers 和 Pages** -> **创建应用程序** -> **Workers** -> **连接到 Git**。
2. 选择您推送的仓库。
3. **构建设置**：
   - **构建命令 (Build command)**: `bun run build` （如果您没有使用 bun，请确保已安装 npm 并可改为 npm 脚本）
   - **部署命令 (Deploy command)**: `npx wrangler deploy`
4. **环境变量 (Secrets)**：在 Cloudflare 项目的环境变量设置中添加：
   - `AUTH_ROOT_SECRET`: 您用于登录后台的管理密码（必填）。
   - *提示：诸如 SMTP 和 Apprise 通知等其他设置，现在可以直接在部署后的管理后台 UI 中动态配置。*

**数据库自动初始化：**
您**不再需要手动执行数据库迁移命令**。系统在首次接收到请求时（如首次访问仪表盘），会自动在您的 D1 数据库中创建所需的所有表结构。

### 本地运行 / 调试
由于本项目底层基于 Bun 和 Cloudflare 的架构，推荐使用 `bun` 或 `npm`。
1. 安装依赖：`npm install`
2. 本地数据库迁移：`npx wrangler d1 execute DB --local --file ./worker-api/migrations/0001_uptime_schema.sql` (需按顺序执行001和002)
3. 复制 `.dev.vars.example` 为 `.dev.vars` 并填入 `AUTH_ROOT_SECRET`。
4. 启动前端和 API 调试服务器：通过分别运行 `npm run dev:web` 和 `npm run dev:api`。
