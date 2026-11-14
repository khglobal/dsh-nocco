# dsh-nocco

[English](README.md) | 中文

在 DeepSeek Harness 里通过对话构建 Vue 3 + Element Plus 网页应用。在你自己的
电脑上运行，使用你选择的模型，不需要账号，也没有服务器。

## 提供的能力

- 技能 `nocco`（在会话里输入 `/nocco`）：说明如何构建和修改应用。
- 工具 `nocco_scaffold`：在空目录里创建应用并安装依赖。
- 工具 `nocco_preview`：启动、停止、检查应用的本机开发服务器。
- 预览工具的结果卡片，带「打开预览」按钮，在右侧栏浏览器页签里打开应用。

## 环境要求

DSH 0.2 系列的 0.2.2-rc.1 或更新版本，Node 20 或更新版本，以及 pnpm 或 npm。

## 安装

    dsh plugin --profile web add dsh-nocco

DSH 桌面版请在「设置 → 插件」里安装。

## 使用

在想放应用的文件夹里打开会话，输入 `/nocco` 并描述你要的应用。Agent 运行工具
前会先请求你批准。

## 数据

应用默认把数据存在浏览器里。要用你自己的 Supabase 项目，把应用里的
`.env.example` 复制为 `.env.local`，填入 URL 和 anon key。Agent 会把表结构变更
写到 `supabase/migrations.sql`，由你在 Supabase 的 SQL 编辑器里执行。插件不会
索要 service key。

## 限制

不含部署和导出。生成的应用没有沙箱：它是普通代码，开发服务器只监听
127.0.0.1。`dsh web` 的浏览器页签默认关闭，这时预览会在新的浏览器窗口打开。

## 开发

    npm install
    npm test        # 先构建，再跑单元测试
    npm run e2e     # 真实创建、安装并启动 Vite 开发服务器

## 许可

MIT。`resources/template/` 里的应用模板使用 MIT-0，你构建的应用不需要保留署名。
