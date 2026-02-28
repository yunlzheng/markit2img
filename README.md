# markit2img

Markdown to image converter with multiple styles and customization options. Powered by Puppeteer.

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

### Features

- Convert Markdown to PNG/JPEG images
- 4 style templates: github, notion, dark, minimal
- Social media size presets (WeChat, XiaoHongShu, Instagram, etc.)
- Customizable typography, colors, and layout
- High-DPI output support

### Installation

```bash
# Clone and install
git clone https://github.com/yunlzheng/markit2img.git
cd markit2img
npm install
npm run build

# Link globally
npm link
```

### Usage

```bash
# Basic usage
markit2img input.md -o output.png

# Specify style
markit2img input.md --style notion -o output.png

# Social media preset
markit2img input.md --size wechat-moment -o output.png

# Custom colors and typography
markit2img input.md \
  --bg "#fffbe6" \
  --h1-size 36 \
  --padding 50 \
  --border-width 2 \
  --border-color "#ffb74d"
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output` | Output file path | output.png |
| `-s, --style` | Style: github, notion, dark, minimal | github |
| `--size` | Size preset (see below) | - |
| `-w, --width` | Image width | 800 |
| `--height` | Fixed height | auto |
| `--scale` | Device scale factor | 2 |
| `-f, --format` | Output: png, jpeg | png |
| `-q, --quality` | JPEG quality | 90 |

#### Typography

| Option | Description |
|--------|-------------|
| `--h1-size` | H1 font size (px) |
| `--h2-size` | H2 font size (px) |
| `--h3-size` | H3 font size (px) |
| `--body-size` | Body font size (px) |
| `--line-height` | Line height |

#### Colors

| Option | Description |
|--------|-------------|
| `--bg` | Background color |
| `--header-color` | Header text color |
| `--body-color` | Body text color |
| `--link-color` | Link color |
| `--code-bg` | Code background color |

#### Layout

| Option | Description |
|--------|-------------|
| `--padding` | Padding (px) |
| `--border-width` | Border width (px) |
| `--border-color` | Border color |
| `--border-radius` | Border radius (px) |

### Size Presets

| Preset | Dimensions | Description |
|--------|------------|-------------|
| wechat-moment | 1080px (auto) | WeChat Moments |
| wechat-article | 900px (auto) | WeChat Article |
| xiaohongshu | 1080×1440 | XiaoHongShu Cover |
| douyin | 1080×1920 | Douyin/TikTok Cover |
| weibo | 1080px (auto) | Weibo |
| instagram-square | 1080×1080 | Instagram Square |
| instagram-portrait | 1080×1350 | Instagram Portrait |
| instagram-story | 1080×1920 | Instagram Story |
| twitter | 1200×675 | Twitter/X |
| facebook | 1200×630 | Facebook |
| mobile | 1080px (auto) | Mobile General |
| tablet | 1536px (auto) | Tablet |

```bash
# List all presets
markit2img --list-sizes
```

---

<a name="中文"></a>
## 中文

### 功能特点

- Markdown 转换为 PNG/JPEG 图片
- 4种风格模板：github、notion、dark、minimal
- 社交媒体尺寸预设（微信、小红书、抖音、Instagram等）
- 自定义排版、颜色、布局
- 高清输出支持

### 安装

```bash
# 克隆并安装
git clone https://github.com/yunlzheng/markit2img.git
cd markit2img
npm install
npm run build

# 全局链接
npm link
```

### 使用方法

```bash
# 基础用法
markit2img input.md -o output.png

# 指定风格
markit2img input.md --style notion -o output.png

# 社交媒体预设
markit2img input.md --size wechat-moment -o output.png

# 自定义颜色和排版
markit2img input.md \
  --bg "#fffbe6" \
  --h1-size 36 \
  --padding 50 \
  --border-width 2 \
  --border-color "#ffb74d"
```

### CLI 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-o, --output` | 输出文件路径 | output.png |
| `-s, --style` | 风格：github, notion, dark, minimal | github |
| `--size` | 尺寸预设 | - |
| `-w, --width` | 图片宽度 | 800 |
| `--height` | 固定高度 | 自适应 |
| `--scale` | 设备像素比 | 2 |
| `-f, --format` | 输出格式：png, jpeg | png |
| `-q, --quality` | JPEG 质量 | 90 |

#### 排版设置

| 参数 | 说明 |
|------|------|
| `--h1-size` | H1 字体大小 (px) |
| `--h2-size` | H2 字体大小 (px) |
| `--h3-size` | H3 字体大小 (px) |
| `--body-size` | 正文字体大小 (px) |
| `--line-height` | 行高 |

#### 颜色设置

| 参数 | 说明 |
|------|------|
| `--bg` | 背景颜色 |
| `--header-color` | 标题颜色 |
| `--body-color` | 正文颜色 |
| `--link-color` | 链接颜色 |
| `--code-bg` | 代码背景颜色 |

#### 布局设置

| 参数 | 说明 |
|------|------|
| `--padding` | 内边距 (px) |
| `--border-width` | 边框宽度 (px) |
| `--border-color` | 边框颜色 |
| `--border-radius` | 边框圆角 (px) |

### 示例

```bash
# 微信朋友圈图片
markit2img article.md --size wechat-moment --style notion

# 小红书封面
markit2img cover.md --size xiaohongshu --bg "#fff5f5"

# 自定义风格
markit2img input.md \
  --style dark \
  --bg "#1a1a1a" \
  --header-color "#00ff88" \
  --h1-size 42 \
  --padding 60
```

## License

MIT
