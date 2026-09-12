# Galatea-Link 移动端应用发布落地页

> 针对 **Galatea-Link**（基于 Flutter 构建的独立移动端游戏 AI Agent）的官方发布展示与下载落地页。

## 🌟 核心特性
- **纯静态高质感架构**：极具科技赛博感的深色毛玻璃现代设计，自适应移动端与桌面端。
- **双下载链路调度**：支持「国内高速镜像源（ghfast.top）」与「GitHub 官方源」一键切换，确保国内用户满速下载。
- **手机扫码下载**：电脑端浏览时支持呼出二维码，手机扫一扫立即拉取 APK。
- **动态版本感知**：内置 GitHub API 动态拉取最新 Release APK 资产与 Star 数。

## 🚀 部署指引

本项目为纯静态结构（HTML5 + CSS3 + Vanilla JS），可一键部署至 Vercel 或 Cloudflare Pages：

### 部署至 Vercel
1. 将本目录推送到您的 GitHub 新仓库（例如 `Noctfom/galatea-link-landing`）；
2. 登录 [Vercel](https://vercel.com/)，点击 **Add New Project** 并导入该仓库；
3. **Framework Preset** 选择 `Other`，Root Directory 保持默认，直接点击 **Deploy**；
4. 部署完成后，在 Vercel 项目的 **Settings -> Domains** 中绑定子域名 `galatea.noctfom.top`；
5. 在您的域名 DNS 控制台（如 Cloudflare）为 `galatea` 添加 CNAME 指向 `cname.vercel-dns.com`。

### 部署至 Cloudflare Pages
1. 在 Cloudflare 控制台选择 **Workers & Pages -> Pages -> Connect to Git**；
2. 绑定该仓库，Build settings 全部留空；
3. 在 Custom Domains 绑定 `galatea.noctfom.top` 即可一键点亮。
