#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { md2img, mdFile2img, closeBrowser, StyleName, OutputFormat, listSizePresets } from './index';

const program = new Command();

program
  .name('markit2img')
  .description('Convert Markdown to image with multiple styles')
  .version('1.0.0')
  .argument('[input]', 'Input markdown file or string')
  .option('-o, --output <path>', 'Output image path', 'output.png')
  .option('-s, --style <style>', 'Style: github, notion, dark, minimal', 'github')
  .option('--size <preset>', 'Size preset (wechat-moment, xiaohongshu, etc.)')
  .option('-w, --width <pixels>', 'Image width')
  .option('--height <pixels>', 'Fixed height')
  .option('--scale <ratio>', 'Device scale factor', '2')
  .option('-f, --format <format>', 'Output format: png, jpeg', 'png')
  .option('-q, --quality <1-100>', 'JPEG quality', '90')
  // Typography
  .option('--h1-size <px>', 'H1 font size')
  .option('--h2-size <px>', 'H2 font size')
  .option('--h3-size <px>', 'H3 font size')
  .option('--body-size <px>', 'Body font size')
  .option('--line-height <num>', 'Line height')
  // Colors
  .option('--bg <color>', 'Background color (e.g., #ffffff)')
  .option('--header-color <color>', 'Header text color')
  .option('--body-color <color>', 'Body text color')
  .option('--link-color <color>', 'Link color')
  .option('--code-bg <color>', 'Code background color')
  // Layout
  .option('--padding <px>', 'Padding', '32')
  .option('--border-width <px>', 'Border width')
  .option('--border-color <color>', 'Border color')
  .option('--border-radius <px>', 'Border radius')
  // Commands
  .option('--list-sizes', 'List size presets')
  .action(async (input: string | undefined, options) => {
    if (options.listSizes) {
      console.log('\n可用的尺寸预设:\n');
      for (const p of listSizePresets()) {
        const dim = p.height ? `${p.width}x${p.height}` : `${p.width}px (自适应)`;
        console.log(`  ${p.name.padEnd(20)} ${dim.padEnd(20)} ${p.description}`);
      }
      console.log('\n用法: markit2img input.md --size wechat-moment');
      process.exit(0);
    }

    if (!input) {
      console.error('Error: missing input');
      console.error('Usage: markit2img <input.md> [options]');
      process.exit(1);
    }

    try {
      const width = options.width ? parseInt(options.width, 10) : undefined;
      const height = options.height ? parseInt(options.height, 10) : undefined;
      const scale = parseFloat(options.scale);
      const quality = parseInt(options.quality, 10);
      
      const isFile = fs.existsSync(input) || input.endsWith('.md');
      const outputPath = options.output || 'output.png';
      
      const outputDir = path.dirname(outputPath);
      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const convertOptions = {
        style: options.style as StyleName,
        width,
        height,
        size: options.size,
        deviceScaleFactor: scale,
        format: options.format as OutputFormat,
        quality,
        useSystemChrome: true,
        // Typography
        h1Size: options.h1Size ? parseInt(options.h1Size, 10) : undefined,
        h2Size: options.h2Size ? parseInt(options.h2Size, 10) : undefined,
        h3Size: options.h3Size ? parseInt(options.h3Size, 10) : undefined,
        bodySize: options.bodySize ? parseInt(options.bodySize, 10) : undefined,
        lineHeight: options.lineHeight ? parseFloat(options.lineHeight) : undefined,
        // Colors
        background: options.bg,
        headerColor: options.headerColor,
        bodyColor: options.bodyColor,
        linkColor: options.linkColor,
        codeBackground: options.codeBg,
        // Layout
        padding: parseInt(options.padding, 10),
        borderWidth: options.borderWidth ? parseInt(options.borderWidth, 10) : undefined,
        borderColor: options.borderColor,
        borderRadius: options.borderRadius ? parseInt(options.borderRadius, 10) : undefined,
      };
      
      const sizeInfo = options.size ? ` (${options.size})` : '';
      console.log(`Converting with style "${options.style}"${sizeInfo}...`);
      
      let result;
      if (isFile) {
        result = await mdFile2img(input, outputPath, convertOptions);
      } else {
        result = await md2img(input, convertOptions);
        await fs.promises.writeFile(outputPath, result.buffer);
      }
      
      console.log(`✓ Output: ${outputPath} (${result.width}x${result.height}px)`);
      await closeBrowser();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      await closeBrowser();
      process.exit(1);
    }
  });

program.parse();
