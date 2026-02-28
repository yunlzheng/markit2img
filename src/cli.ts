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
  .argument('[input]', 'Input markdown file path or markdown string')
  .option('-o, --output <path>', 'Output image path (default: output.png)')
  .option('-s, --style <style>', 'Style: github, notion, dark, minimal', 'github')
  .option('--size <preset>', 'Size preset (e.g., wechat-moment, mobile)')
  .option('-w, --width <pixels>', 'Image width in pixels')
  .option('--height <pixels>', 'Fixed height in pixels')
  .option('--scale <ratio>', 'Device scale factor', '2')
  .option('-f, --format <format>', 'Output format: png or jpeg', 'png')
  .option('-q, --quality <1-100>', 'JPEG quality', '90')
  .option('--list-sizes', 'List all size presets')
  .action(async (input: string | undefined, options) => {
    if (options.listSizes) {
      console.log('\n可用的尺寸预设:\n');
      for (const p of listSizePresets()) {
        const dim = p.height ? `${p.width}x${p.height}` : `${p.width}px (自适应高度)`;
        console.log(`  ${(p.name).padEnd(20)} ${dim.padEnd(22)} ${p.description}`);
      }
      console.log('\n用法: markit2img input.md --size wechat-moment');
      process.exit(0);
    }

    if (!input) {
      console.error('Error: missing required argument \'input\'');
      console.error('Run with --help for usage information');
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
      };
      
      const sizeInfo = options.size ? ` (${options.size})` : '';
      console.log(`Converting with style "${options.style}"${sizeInfo}...`);
      
      let result;
      if (isFile) {
        console.log(`Input file: ${input}`);
        result = await mdFile2img(input, outputPath, convertOptions);
      } else {
        console.log('Input: markdown string');
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
