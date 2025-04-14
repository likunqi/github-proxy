# GitHub代理/镜像

使用Cloudflare Workers或Pages创建GitHub代理，解决国内无法访问GitHub的问题。

## 方案对比

本项目提供三种方案:

1. **基础版Worker** (`worker.js`): 基本的GitHub代理功能
2. **增强版Worker** (`enhanced-worker.js`): 增强了HTML内容的链接重写和资源处理
3. **Pages方案** (`pages-function.js`): 使用Cloudflare Pages Functions实现的完整解决方案

## 部署方法

### 方法1: 使用Cloudflare Workers

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入Workers & Pages菜单
3. 点击"创建应用程序"
4. 选择"创建Worker"
5. 删除默认代码，复制粘贴`worker.js`或`enhanced-worker.js`的内容
6. 点击"部署"按钮
7. 部署成功后，你将获得一个类似`https://your-worker-name.your-account.workers.dev`的URL

### 方法2: 使用Cloudflare Pages

1. 创建一个空的GitHub/GitLab仓库
2. 将本项目文件添加到仓库
3. 在仓库根目录创建`_worker.js`文件（复制`pages-function.js`的内容）
4. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
5. 进入Workers & Pages菜单
6. 点击"创建应用程序"
7. 选择"连接到Git"，连接到你的仓库
8. 按照向导操作完成部署
9. 部署成功后，你将获得一个类似`https://your-project-name.pages.dev`的URL

### 可选: 设置环境变量

如果你需要提高API访问限制，可以添加GitHub Token:

1. 在Cloudflare Workers/Pages设置中，找到"环境变量"选项
2. 添加名为`GITHUB_TOKEN`的变量，值设为你的GitHub个人访问令牌
3. 保存设置并重新部署

## 使用方法

部署后，可以通过以下方式使用:

- 访问GitHub页面: `https://your-domain.com/用户名/仓库名`
- 访问GitHub API: `https://your-domain.com/api/...`
- 访问Raw内容: `https://your-domain.com/raw/用户名/仓库名/分支/文件路径`

例如:
- 原始链接: `https://github.com/microsoft/vscode`
- 代理链接: `https://your-domain.com/microsoft/vscode`

## 注意事项

1. 此代理仅提供基本的GitHub访问功能，某些复杂操作可能不支持
2. 不建议在代理上登录GitHub账号，有安全风险
3. GitHub有访问频率限制，如遇到限制请添加Token或减少请求频率
4. 仅供个人学习和研究使用，请遵守相关法律法规
