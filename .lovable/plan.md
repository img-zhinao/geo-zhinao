
## 实施计划：Footer 增加隐私政策、服务条款和网站地图

### 概述

在页脚右下角区域添加三个法律/导航链接：隐私政策、服务条款、网站地图。其中网站地图将特别优化以符合 GEO（生成式搜索引擎优化）要求，采用 XML 格式并包含结构化数据。

---

### 第一步：创建法律页面

创建两个新页面组件：

| 文件 | 说明 |
|------|------|
| `src/pages/PrivacyPolicy.tsx` | 隐私政策页面 - 包含数据收集、使用、存储等内容 |
| `src/pages/TermsOfService.tsx` | 服务条款页面 - 包含使用条款、免责声明等内容 |

页面特点：
- 使用 react-helmet-async 设置 SEO meta 标签
- 响应式布局，与网站整体风格一致
- 支持多语言（使用 i18n）

---

### 第二步：创建 GEO 优化的网站地图

创建符合 GEO 要求的网站地图：

**XML Sitemap (`public/sitemap.xml`)**

```text
包含以下元素：
- 所有公开页面的 URL（首页、隐私政策、服务条款等）
- lastmod: 最后修改日期
- changefreq: 更新频率
- priority: 页面优先级
- 支持多语言的 hreflang 标签（zh-CN, en, pt, vi）
```

**HTML Sitemap 页面 (`src/pages/Sitemap.tsx`)**

- 人类可读的网站地图页面
- 分类展示所有页面链接
- 支持多语言
- 添加 Schema.org 的 SiteNavigationElement 结构化数据

**更新 robots.txt**

添加 Sitemap 指向：
```text
Sitemap: https://geo-zhinao.lovable.app/sitemap.xml
```

---

### 第三步：更新路由配置

在 `src/App.tsx` 中添加新路由：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/privacy` | PrivacyPolicy | 隐私政策 |
| `/terms` | TermsOfService | 服务条款 |
| `/sitemap` | Sitemap | HTML网站地图 |

---

### 第四步：更新翻译文件

在所有语言文件中添加新的翻译键：

**footer 部分新增：**

| 键 | zh-CN | en | pt | vi |
|-----|-------|-----|-----|-----|
| `footer.privacy` | 隐私政策 | Privacy Policy | Política de Privacidade | Chính sách Bảo mật |
| `footer.terms` | 服务条款 | Terms of Service | Termos de Serviço | Điều khoản Dịch vụ |
| `footer.sitemap` | 网站地图 | Sitemap | Mapa do Site | Sơ đồ Trang web |

**新增 legal 部分（用于法律页面内容）：**

包含隐私政策和服务条款的完整内容翻译。

---

### 第五步：更新 Footer 组件

修改 `src/components/Footer.tsx`：

- 重构底部版权区域布局为两栏结构
- 左侧：版权信息 + ICP备案号
- 右侧：隐私政策 | 服务条款 | 网站地图 链接
- 使用 react-router-dom 的 Link 组件进行内部导航
- 保持响应式设计（移动端垂直堆叠）

布局示意：
```text
┌────────────────────────────────────────────────────────────┐
│  © 2026 深圳智脑时代科技有限公司 版权所有                    │
│  粤ICP备2023101390号                                        │
│                                                            │
│                         隐私政策 | 服务条款 | 网站地图      │
└────────────────────────────────────────────────────────────┘
```

---

### GEO 优化特点

网站地图将包含以下 GEO 优化元素：

1. **XML Sitemap 规范**
   - 符合 sitemaps.org 协议
   - 包含 xhtml:link 多语言标签
   - 设置合理的 priority 和 changefreq

2. **结构化数据**
   - HTML 网站地图页面添加 Schema.org 标记
   - 使用 SiteNavigationElement 类型

3. **爬虫友好**
   - robots.txt 明确指向 sitemap.xml
   - 所有页面都有清晰的语义化 HTML 结构

4. **多语言支持**
   - 每个 URL 都有对应的 hreflang 标签
   - 支持中文、英文、葡萄牙语、越南语

---

### 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/pages/PrivacyPolicy.tsx` | 新建 |
| `src/pages/TermsOfService.tsx` | 新建 |
| `src/pages/Sitemap.tsx` | 新建 |
| `public/sitemap.xml` | 新建 |
| `public/robots.txt` | 修改（添加 Sitemap 指向） |
| `src/App.tsx` | 修改（添加新路由） |
| `src/components/Footer.tsx` | 修改（添加链接） |
| `src/locales/zh-CN.json` | 修改（添加翻译） |
| `src/locales/en.json` | 修改（添加翻译） |
| `src/locales/pt.json` | 修改（添加翻译） |
| `src/locales/vi.json` | 修改（添加翻译） |
