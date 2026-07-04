# 西城区心理健康与传统文化素养调查 · H5

**独立项目**，与「小麒小麟专注引擎」微信小程序（`miniprogram-2`）完全分开。

- 本项目：西城区教科研调查问卷 H5（学生 / 家长 / 教师）
- 小程序：`../miniprogram-2`（专注引擎产品，与本问卷无品牌绑定）

界面为简洁蓝白问卷风格（对话气泡提示），**不含**小麒小麟角色图标。

## 功能范围（Phase 0）

- [x] 三角色入口、隐私知情同意、基本信息、完整题目
- [x] 学生版学段选项切换（小学三档 / 初中四档）
- [x] 错位配对题标注、选答题、本机草稿、JSON 导出
- [ ] 服务端存储、计分、错位度分析、报告（待下一阶段）

## 本地预览

在本项目根目录双击 `index.html`，或用 Live Server 打开。

## 目录结构

```
xicheng-survey-h5/
  index.html
  css/style.css
  js/config.js
  js/app.js
  js/data/*.js
  scripts/build-questions.js
  assets/icons/student.svg, parent.svg, teacher.svg
```

## 修改题目

编辑 `scripts/build-questions.js` 后：

```bash
node scripts/build-questions.js
```

## Git 仓库

本项目为独立 Git 仓库，远程：

```
https://github.com/naturalneoverse/xicheng-survey-h5.git
```

## 手机 / 微信预览（GitHub Pages）

**可以实现。** 问卷是纯静态网页，适合 GitHub Pages 免费托管，得到 **HTTPS** 公网地址，微信里才能稳定打开。

### 为什么微信打不开本地地址？

| 地址类型 | 微信能否打开 |
|----------|--------------|
| `file://` 或双击 html | ❌ |
| `http://192.168.x.x:8080`（局域网） | ❌ 一般不行（仅同一 WiFi 的手机浏览器有时可以） |
| `https://naturalneoverse.github.io/xicheng-survey-h5/` | ✅ 公网 HTTPS，可发微信 |

### 部署步骤

**1. 先把代码推送到 GitHub**（需能访问 GitHub，必要时开 VPN）

```bash
cd C:\Users\24382\WeChatProjects\xicheng-survey-h5
git push -u origin main
```

**2. 在 GitHub 网页开启 Pages**

1. 打开 https://github.com/naturalneoverse/xicheng-survey-h5  
2. **Settings** → 左侧 **Pages**  
3. **Build and deployment** → Source 选 **Deploy from a branch**  
4. Branch 选 **main**，文件夹选 **/ (root)**，点 **Save**  
5. 等 1～3 分钟，页面会显示站点地址，一般为：

```
https://naturalneoverse.github.io/xicheng-survey-h5/
```

**3. 在微信里打开**

- 把上面完整 **https** 链接发到「文件传输助手」  
- 点链接，用微信内置浏览器打开即可填写问卷  

### 国内访问说明

- GitHub Pages 在国外服务器，国内有时**慢或偶发打不开**  
- 若学校/家长普遍用微信，正式投放可考虑：  
  - **Gitee Pages**（国内）  
  - **腾讯云 / 阿里云** 静态网站托管（绑自己的域名 + 备案）  

Phase 0 测试用 GitHub Pages 足够；大规模发放再迁国内托管更稳。

## 关联说明

产品思路备忘见小程序仓库：`miniprogram-2/docs/h5-nfc-test-product-sketch.md`（仅文档参考，代码分离）。
