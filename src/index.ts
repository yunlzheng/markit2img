import puppeteer, { Browser, LaunchOptions } from 'puppeteer';
import { marked } from 'marked';
import * as fs from 'fs';

export type StyleName = 'github' | 'notion' | 'dark' | 'minimal';
export type OutputFormat = 'png' | 'jpeg';

export interface SizePreset {
  name: string;
  width: number;
  height?: number;
  description: string;
}

export const SIZE_PRESETS: Record<string, SizePreset> = {
  'wechat-moment': { name: 'wechat-moment', width: 1080, description: '微信朋友圈' },
  'wechat-article': { name: 'wechat-article', width: 900, description: '微信公众号' },
  'xiaohongshu': { name: 'xiaohongshu', width: 1080, height: 1440, description: '小红书封面' },
  'douyin': { name: 'douyin', width: 1080, height: 1920, description: '抖音封面' },
  'weibo': { name: 'weibo', width: 1080, description: '微博长图' },
  'instagram-square': { name: 'instagram-square', width: 1080, height: 1080, description: 'Instagram方图' },
  'instagram-portrait': { name: 'instagram-portrait', width: 1080, height: 1350, description: 'Instagram竖图' },
  'instagram-story': { name: 'instagram-story', width: 1080, height: 1920, description: 'Instagram Story' },
  'twitter': { name: 'twitter', width: 1200, height: 675, description: 'Twitter/X' },
  'facebook': { name: 'facebook', width: 1200, height: 630, description: 'Facebook' },
  'mobile': { name: 'mobile', width: 1080, description: '移动端通用' },
  'tablet': { name: 'tablet', width: 1536, description: '平板端' },
};

export function listSizePresets(): SizePreset[] {
  return Object.values(SIZE_PRESETS);
}

export function getSizePreset(name: string): SizePreset | undefined {
  return SIZE_PRESETS[name];
}

export interface Md2ImgOptions {
  style?: StyleName;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  format?: OutputFormat;
  quality?: number;
  customCss?: string;
  useSystemChrome?: boolean;
  chromePath?: string;
  size?: string;
}

export interface Md2ImgResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: OutputFormat;
}

const STYLES: Record<StyleName, string> = {
  github: `:root{--bg:#fff;--text:#24292f;--link:#0969da;--code-bg:#f6f8fa;--border:#d0d7de;--quote:#57606a}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:var(--text);background:var(--bg);padding:32px}h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600}h1{font-size:2em;border-bottom:1px solid var(--border);padding-bottom:.3em}h2{font-size:1.5em;border-bottom:1px solid var(--border);padding-bottom:.3em}p{margin-bottom:16px}a{color:var(--link)}code{padding:.2em .4em;font-size:85%;background:var(--code-bg);border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}pre{padding:16px;overflow:auto;background:var(--code-bg);border-radius:6px}pre code{background:transparent;padding:0}blockquote{padding:0 1em;color:var(--quote);border-left:.25em solid var(--border);margin:0 0 16px 0}ul,ol{padding-left:2em;margin-bottom:16px}table{border-collapse:collapse;margin-bottom:16px}th,td{padding:6px 13px;border:1px solid var(--border)}th{font-weight:600;background:var(--code-bg)}hr{border:0;border-top:1px solid var(--border);margin:24px 0}`,
  notion: `:root{--bg:#fff;--text:#37352f;--link:#37352f;--code-bg:rgba(135,131,120,0.15);--border:#e9e9e7;--quote:#787774}body{font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.7;color:var(--text);background:var(--bg);padding:40px}h1,h2,h3,h4,h5,h6{margin-top:28px;margin-bottom:4px;font-weight:600}h1{font-size:2.5em}h2{font-size:1.8em}p{margin-bottom:12px}a{color:var(--link);text-decoration:underline}code{padding:2px 5px;font-size:85%;background:var(--code-bg);border-radius:3px;font-family:SFMono-Regular,Menlo,monospace}pre{padding:16px;overflow:auto;background:var(--code-bg);border-radius:3px}pre code{background:transparent}blockquote{padding-left:14px;border-left:3px solid var(--text);margin:0 0 12px 0;color:var(--quote)}ul,ol{padding-left:24px;margin-bottom:12px}table{border-collapse:collapse}th,td{padding:8px 12px;border-bottom:1px solid var(--border)}`,
  dark: `:root{--bg:#0d1117;--text:#c9d1d9;--link:#58a6ff;--code-bg:#161b22;--border:#30363d;--quote:#8b949e}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:var(--text);background:var(--bg);padding:32px}h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600;color:#f0f6fc}h1{font-size:2em;border-bottom:1px solid var(--border);padding-bottom:.3em}h2{font-size:1.5em;border-bottom:1px solid var(--border);padding-bottom:.3em}p{margin-bottom:16px}a{color:var(--link)}code{padding:.2em .4em;font-size:85%;background:var(--code-bg);border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}pre{padding:16px;overflow:auto;background:var(--code-bg);border-radius:6px}pre code{background:transparent}blockquote{padding:0 1em;color:var(--quote);border-left:.25em solid var(--border);margin:0 0 16px 0}ul,ol{padding-left:2em;margin-bottom:16px}table{border-collapse:collapse;margin-bottom:16px}th,td{padding:6px 13px;border:1px solid var(--border)}th{font-weight:600;background:var(--code-bg)}`,
  minimal: `:root{--bg:#fff;--text:#333;--link:#0066cc;--code-bg:#f5f5f5;--border:#e0e0e0;--quote:#666}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:var(--text);background:var(--bg);padding:24px}h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:12px;font-weight:600}h1{font-size:1.8em}h2{font-size:1.4em}p{margin-bottom:12px}a{color:var(--link)}code{padding:2px 6px;font-size:90%;background:var(--code-bg);border-radius:3px;font-family:SFMono-Regular,Menlo,monospace}pre{padding:12px;overflow:auto;background:var(--code-bg);border-radius:3px}pre code{background:transparent}blockquote{padding-left:12px;border-left:3px solid var(--border);margin:12px 0;color:var(--quote)}ul,ol{padding-left:20px}table{border-collapse:collapse}th,td{padding:8px 12px;border-bottom:1px solid var(--border)}`,
};

let browser: Browser | null = null;

async function getBrowser(useSystemChrome: boolean, chromePath?: string): Promise<Browser> {
  if (browser) return browser;
  const launchOptions: LaunchOptions = { headless: true };
  if (useSystemChrome) {
    launchOptions.executablePath = chromePath || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  browser = await puppeteer.launch(launchOptions);
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) { await browser.close(); browser = null; }
}

export async function md2img(markdown: string, options: Md2ImgOptions = {}): Promise<Md2ImgResult> {
  let width = options.width || 800;
  let fixedHeight = options.height;
  
  if (options.size && SIZE_PRESETS[options.size]) {
    const preset = SIZE_PRESETS[options.size];
    width = preset.width;
    if (preset.height) fixedHeight = preset.height;
  }
  
  const scale = options.deviceScaleFactor || 2;
  const styleCss = STYLES[options.style || 'github'];
  const padding = width >= 1080 ? 48 : 32;
  
  const html = await marked(markdown);
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}html,body{margin:0;padding:0}${styleCss}body{padding:${padding}px}</style></head><body>${html}</body></html>`;
  
  const b = await getBrowser(options.useSystemChrome !== false, options.chromePath);
  const page = await b.newPage();
  try {
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await page.setViewport({ width, height: fixedHeight || 100, deviceScaleFactor: scale });
    
    let height = fixedHeight;
    if (!height) {
      height = await page.evaluate(() => Math.ceil(document.body.scrollHeight + 1));
      await page.setViewport({ width, height, deviceScaleFactor: scale });
    }
    
    const uint8Array = await page.screenshot({ 
      type: options.format || 'png', 
      quality: options.format === 'jpeg' ? (options.quality || 90) : undefined, 
      fullPage: !fixedHeight 
    }) as Uint8Array;
    
    return { buffer: Buffer.from(uint8Array), width: width * scale, height: height * scale, format: options.format || 'png' };
  } finally { await page.close(); }
}

export async function mdFile2img(inputPath: string, outputPath: string, options: Md2ImgOptions = {}): Promise<Md2ImgResult> {
  const markdown = await fs.promises.readFile(inputPath, 'utf-8');
  const result = await md2img(markdown, options);
  await fs.promises.writeFile(outputPath, result.buffer);
  return result;
}
