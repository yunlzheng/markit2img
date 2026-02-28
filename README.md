# markit2img

Markdown to image converter with multiple styles. Powered by Puppeteer.

## Features

- Convert Markdown to PNG/JPEG images
- Multiple style templates (github, notion, dark, minimal)
- CLI tool support
- OpenClaw Skill integration

## Installation

```bash
npm install -g markit2img
```

## CLI Usage

```bash
# Basic usage
markit2img input.md -o output.png

# Specify style
markit2img input.md --style notion -o output.png

# Custom width
markit2img input.md --style github --width 1200 -o output.png

# Output as JPEG
markit2img input.md --style dark -o output.jpg
```

## Styles

- `github` - GitHub-flavored markdown style
- `notion` - Clean Notion-like style
- `dark` - Dark mode style
- `minimal` - Minimal clean style

## License

MIT
