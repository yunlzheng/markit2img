#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { md2img, mdFile2img, closeBrowser, StyleName, OutputFormat } from './index';

const program = new Command();

program
  .name('markit2img')
  .description('Convert Markdown to image with multiple styles')
  .version('1.0.0')
  .argument('<input>', 'Input markdown file path or markdown string')
  .option('-o, --output <path>', 'Output image path (default: output.png)')
  .option('-s, --style <style>', 'Style template: github, notion, dark, minimal', 'github')
  .option('-w, --width <pixels>', 'Image width in pixels', '800')
  .option('--scale <ratio>', 'Device scale factor for high-DPI', '2')
  .option('-f, --format <format>', 'Output format: png or jpeg', 'png')
  .option('-q, --quality <1-100>', 'JPEG quality (1-100)', '90')
  .option('--chrome-path <path>', 'Path to Chrome executable')
  .action(async (input: string, options) => {
    try {
      const width = parseInt(options.width, 10);
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
        deviceScaleFactor: scale,
        format: options.format as OutputFormat,
        quality,
        useSystemChrome: true,
        chromePath: options.chromePath,
      };
      console.log(`Converting with style "${options.style}"...`);
      let result;
      if (isFile) {
        console.log(`Input file: ${input}`);
        result = await mdFile2img(input, outputPath, convertOptions);
      } else {
        console.log('Input: markdown string');
        result = await md2img(input, convertOptions);
        await fs.promises.writeFile(outputPath, result.buffer);
      }
      console.log(`✓ Output saved to: ${outputPath}`);
      console.log(`  Size: ${result.width}x${result.height}px`);
      await closeBrowser();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      await closeBrowser();
      process.exit(1);
    }
  });

program.parse();
