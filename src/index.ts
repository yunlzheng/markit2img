import puppeteer, { Browser, LaunchOptions } from 'puppeteer';
import { marked } from 'marked';
import * as fs from 'fs';

export type StyleName = 'github' | 'notion' | 'dark' | 'minimal';
export type OutputFormat = 'png' | 'jpeg';

export interface TypographyOptions {
  h1Size?: number;
  h2Size?: number;
  h3Size?: number;
  bodySize?: number;
  lineHeight?: number;
}

export interface ColorOptions {
  background?: string;
  headerColor?: string;
  bodyColor?: string;
  linkColor?: string;
  codeBackground?: string;
}

export interface LayoutOptions {
  padding?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
}

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
  useSystemChrome?: boolean;
  chromePath?: string;
  size?: string;
  // Typography
  h1Size?: number;
  h2Size?: number;
  h3Size?: number;
  bodySize?: number;
  lineHeight?: number;
  // Colors
  background?: string;
  headerColor?: string;
  bodyColor?: string;
  linkColor?: string;
  codeBackground?: string;
  // Layout
  padding?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  // Custom CSS
  customCss?: string;
}

export interface Md2ImgResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: OutputFormat;
}

const BASE_STYLES: Record<StyleName, string> = {
  github: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    a { text-decoration: none; }
    h1, h2 { border-bottom: 1px solid #e1e4e8; padding-bottom: .3em; }
    code { border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    pre { border-radius: 6px; }
    blockquote { border-left: .25em solid #dfe2e5; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    th { font-weight: 600; }
  `,
  notion: `
    body { font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    a { text-decoration: underline; }
    code { border-radius: 3px; font-family: SFMono-Regular, Menlo, monospace; }
    pre { border-radius: 3px; }
    blockquote { border-left: 3px solid; }
    th, td { border-bottom: 1px solid; padding: 8px 12px; }
  `,
  dark: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    a { text-decoration: none; }
    h1, h2 { border-bottom: 1px solid; padding-bottom: .3em; }
    code { border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    pre { border-radius: 6px; }
    blockquote { border-left: .25em solid; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid; padding: 6px 13px; }
    th { font-weight: 600; }
  `,
  minimal: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    a { text-decoration: none; }
    code { border-radius: 3px; font-family: SFMono-Regular, Menlo, monospace; }
    pre { border-radius: 3px; }
    blockquote { border-left: 3px solid; }
    th, td { border-bottom: 1px solid; padding: 8px 12px; }
  `,
};

const DEFAULT_COLORS: Record<StyleName, ColorOptions> = {
  github: { background: '#ffffff', headerColor: '#24292f', bodyColor: '#24292f', linkColor: '#0969da', codeBackground: '#f6f8fa' },
  notion: { background: '#ffffff', headerColor: '#37352f', bodyColor: '#37352f', linkColor: '#37352f', codeBackground: 'rgba(135,131,120,0.15)' },
  dark: { background: '#0d1117', headerColor: '#f0f6fc', bodyColor: '#c9d1d9', linkColor: '#58a6ff', codeBackground: '#161b22' },
  minimal: { background: '#ffffff', headerColor: '#333333', bodyColor: '#333333', linkColor: '#0066cc', codeBackground: '#f5f5f5' },
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

function buildCss(options: Md2ImgOptions): string {
  const style = options.style || 'github';
  const defaults = DEFAULT_COLORS[style];
  
  const h1Size = options.h1Size || 28;
  const h2Size = options.h2Size || 22;
  const h3Size = options.h3Size || 18;
  const bodySize = options.bodySize || 14;
  const lineHeight = options.lineHeight || 1.6;
  
  const bg = options.background || defaults.background || '#ffffff';
  const headerColor = options.headerColor || defaults.headerColor || '#333333';
  const bodyColor = options.bodyColor || defaults.bodyColor || '#333333';
  const linkColor = options.linkColor || defaults.linkColor || '#0969da';
  const codeBg = options.codeBackground || defaults.codeBackground || '#f5f5f5';
  
  const padding = options.padding || 32;
  const borderWidth = options.borderWidth || 0;
  const borderColor = options.borderColor || '#e1e4e8';
  const borderRadius = options.borderRadius || 0;
  
  return `
    :root {
      --bg: ${bg};
      --header-color: ${headerColor};
      --body-color: ${bodyColor};
      --link-color: ${linkColor};
      --code-bg: ${codeBg};
      --border-color: ${borderColor};
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { margin: 0; padding: 0; }
    
    body {
      background: var(--bg);
      color: var(--body-color);
      font-size: ${bodySize}px;
      line-height: ${lineHeight};
      padding: ${padding}px;
      ${borderWidth > 0 ? `border: ${borderWidth}px solid var(--border-color);` : ''}
      ${borderRadius > 0 ? `border-radius: ${borderRadius}px;` : ''}
    }
    
    h1, h2, h3, h4, h5, h6 { color: var(--header-color); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    h1 { font-size: ${h1Size}px; }
    h2 { font-size: ${h2Size}px; }
    h3 { font-size: ${h3Size}px; }
    h4 { font-size: ${h3Size}px; }
    
    p { margin-bottom: 1em; }
    a { color: var(--link-color); }
    
    code { 
      background: var(--code-bg); 
      padding: 0.2em 0.4em; 
      font-size: 0.9em;
    }
    pre { 
      background: var(--code-bg); 
      padding: 1em; 
      overflow-x: auto;
      margin-bottom: 1em;
    }
    pre code { background: transparent; padding: 0; }
    
    blockquote { 
      border-left: 4px solid var(--border-color); 
      padding-left: 1em; 
      margin: 1em 0;
      color: #666;
    }
    
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    li { margin: 0.25em 0; }
    
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid var(--border-color); padding: 8px 12px; text-align: left; }
    th { background: var(--code-bg); font-weight: 600; }
    
    hr { border: none; border-top: 1px solid var(--border-color); margin: 2em 0; }
    img { max-width: 100%; }
    
    ${BASE_STYLES[style]}
    ${options.customCss || ''}
  `;
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
  const css = buildCss(options);
  const html = await marked(markdown);
  
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}</body></html>`;
  
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
