# 西城区心理健康与传统文化素养调查 · H5

**独立项目**，与小麒小麟专注引擎微信小程序（`miniprogram-2`）分开维护。

- 本项目：西城区教科研调查问卷 H5（学生 / 家长 / 教师）
- 小程序项目：`../miniprogram-2`（小麒小麟专注引擎 · 静和哲思）

视觉风格沿用小麒小麟气泡 UI，但代码、部署、数据存储均独立。

## 功能范围（Phase 0）

- [x] 三角色入口、隐私知情同意、基本信息、完整题目
- [x] 学生版学段选项切换（小学三档 / 初中四档）
- [x] 错位配对题标注、选答题、本机草稿、JSON 导出
- [ ] 服务端存储、计分、错位度分析、报告（待下一阶段）

## 本地预览

在本项目根目录：

```bash
# 若已安装 Node.js
npx serve . -p 5173
```

浏览器打开 <http://localhost:5173>，或直接打开 `index.html`。

## 目录结构

```
xicheng-survey-h5/
  index.html
  css/style.css
  js/config.js
  js/app.js
  js/data/*.js
  scripts/build-questions.js
  assets/xiaoqi.png, xiaolin.png
```

## 修改题目

编辑 `scripts/build-questions.js` 后：

```bash
node scripts/build-questions.js
```

## 部署建议

- 单独 HTTPS 域名（如 `survey.example.com`）
- 与小程序云开发/数据库可后续 API 对接，但仓库与发布流程保持分离

## Git 仓库

本项目为**独立 Git 仓库**（与 `miniprogram-2` 无关）：

```bash
cd C:\Users\24382\WeChatProjects\xicheng-survey-h5
git status
```

推送到 GitHub / Gitee 等远程（示例）：

```bash
git remote add origin <你的远程仓库 URL>
git push -u origin main
```

## 关联说明

产品思路备忘见小程序仓库：`miniprogram-2/docs/h5-nfc-test-product-sketch.md`（文档可复用，代码不在该仓库内）。
