#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Command } from 'commander';
import { glob } from 'glob';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageLabelerCLI {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.apiKey = '';
        // Use global config directory for API key
        this.configPath = path.join(os.homedir(), '.image-labeler-config');
    }

    async loadConfig() {
        try {
            const config = await fs.readFile(this.configPath, 'utf-8');
            const lines = config.split('\n');
            for (const line of lines) {
                if (line.startsWith('GEMINI_API_KEY=')) {
                    this.apiKey = line.split('=')[1].trim();
                    break;
                }
            }
        } catch (error) {
            // Config file doesn't exist yet
        }
    }

    async saveConfig() {
        const config = `GEMINI_API_KEY=${this.apiKey}\n`;
        await fs.writeFile(this.configPath, config);
    }

    async initializeGemini() {
        if (!this.apiKey) {
            throw new Error('API key not found. Please set it first using: image-labeler config --api-key YOUR_KEY');
        }
        
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async analyzeImage(imagePath) {
        console.log(chalk.blue(`Analyzing: ${path.basename(imagePath)}`));
        
        try {
            const imageBuffer = await fs.readFile(imagePath);
            const mimeType = this.getMimeType(imagePath);
            
            const prompt = `Analyze this image and suggest a descriptive filename. The filename should be detailed and descriptive, explaining what's in the image, the setting, colors, objects, people, actions, etc. Make it clear where this image would be useful. Return only the filename without extension, use underscores instead of spaces, and make it between 20-100 characters. Be very descriptive but concise.`;

            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: mimeType
                    }
                }
            ]);

            const response = await result.response;
            const suggestedName = response.text().trim();
            const extension = path.extname(imagePath);
            
            return `${suggestedName}${extension}`;
        } catch (error) {
            console.error(chalk.red(`Error analyzing ${imagePath}:`, error.message));
            return null;
        }
    }

    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp'
        };
        return mimeTypes[ext] || 'image/jpeg';
    }

    async renameFile(oldPath, newName, dryRun = false, convertToWebP = false) {
        const dir = path.dirname(oldPath);
        let finalName = newName;
        
        // Convert extension to .webp if requested
        if (convertToWebP) {
            const baseName = path.basename(newName, path.extname(newName));
            finalName = `${baseName}.webp`;
        }
        
        const newPath = path.join(dir, finalName);
        
        if (dryRun) {
            if (convertToWebP) {
                console.log(chalk.yellow(`Would convert & rename: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(finalName)} (WebP)`));
            } else {
                console.log(chalk.yellow(`Would rename: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(finalName)}`));
            }
            return;
        }

        try {
            // Check if new filename already exists
            let targetPath = newPath;
            let targetName = finalName;
            
            try {
                await fs.access(newPath);
                const timestamp = Date.now();
                const ext = path.extname(finalName);
                const baseName = path.basename(finalName, ext);
                targetName = `${baseName}_${timestamp}${ext}`;
                targetPath = path.join(dir, targetName);
            } catch {
                // File doesn't exist, safe to use
            }
            
            if (convertToWebP) {
                // Convert to WebP and save with new name
                await sharp(oldPath)
                    .webp({ quality: 85 })
                    .toFile(targetPath);
                
                // Remove original file
                await fs.unlink(oldPath);
                
                if (targetName !== finalName) {
                    console.log(chalk.green(`Converted & renamed: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(targetName)} (WebP, added timestamp to avoid conflict)`));
                } else {
                    console.log(chalk.green(`Converted & renamed: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(targetName)} (WebP)`));
                }
            } else {
                // Just rename
                await fs.rename(oldPath, targetPath);
                
                if (targetName !== finalName) {
                    console.log(chalk.green(`Renamed: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(targetName)} (added timestamp to avoid conflict)`));
                } else {
                    console.log(chalk.green(`Renamed: ${chalk.cyan(path.basename(oldPath))} → ${chalk.green(targetName)}`));
                }
            }
        } catch (error) {
            console.error(chalk.red(`Error processing ${oldPath}:`, error.message));
        }
    }

    async processImages(pattern, options = {}) {
        const { dryRun = false, verbose = false, webp = false } = options;
        
        await this.loadConfig();
        
        // Only initialize Gemini if not in dry run mode
        if (!dryRun) {
            await this.initializeGemini();
        }
        
        const imageExtensions = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webp', '**/*.bmp'];
        let files = [];
        
        if (pattern.includes('*') || pattern.includes('?')) {
            // It's a glob pattern
            files = await glob(pattern, { nodir: true });
        } else {
            // Check if it's a file or directory
            const stats = await fs.stat(pattern);
            if (stats.isFile()) {
                files = [pattern];
            } else if (stats.isDirectory()) {
                // Process all images in directory
                for (const ext of imageExtensions) {
                    const dirPattern = path.join(pattern, ext);
                    const dirFiles = await glob(dirPattern, { nodir: true });
                    files.push(...dirFiles);
                }
            }
        }
        
        if (files.length === 0) {
            console.log(chalk.yellow('No image files found matching the pattern.'));
            return;
        }
        
        console.log(chalk.blue(`Found ${files.length} image(s) to process...\n`));
        
        if (dryRun) {
            console.log(chalk.yellow('DRY RUN MODE - No files will be renamed\n'));
            if (webp) {
                console.log(chalk.blue('WebP conversion enabled\n'));
            }
            // In dry run mode, just show what files would be processed
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (webp) {
                    console.log(chalk.yellow(`Would analyze & convert: ${chalk.cyan(path.basename(file))} → WebP`));
                } else {
                    console.log(chalk.yellow(`Would analyze: ${chalk.cyan(path.basename(file))}`));
                }
                console.log(chalk.yellow(`Full path: ${file}`));
                console.log('');
            }
            console.log(chalk.green(`✓ Would process ${files.length} image(s)`));
            return;
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (verbose) {
                console.log(chalk.gray(`Processing ${i + 1}/${files.length}: ${file}`));
            }
            
            const newName = await this.analyzeImage(file);
            if (newName) {
                await this.renameFile(file, newName, dryRun, webp);
            }
            
            console.log(''); // Empty line for readability
            
            // Small delay to respect API rate limits
            if (i < files.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(chalk.green(`✓ Processed ${files.length} image(s)`));
    }
}

const program = new Command();
const labeler = new ImageLabelerCLI();

program
    .name('image-labeler')
    .description('AI-powered image labeler and renamer using Gemini AI')
    .version('1.0.0');

program
    .command('config')
    .description('Configure the application')
    .option('--api-key <key>', 'Set Gemini API key')
    .action(async (options) => {
        if (options.apiKey) {
            labeler.apiKey = options.apiKey;
            await labeler.saveConfig();
            console.log(chalk.green('✓ API key saved successfully!'));
        } else {
            await labeler.loadConfig();
            if (labeler.apiKey) {
                console.log(chalk.green('✓ API key is configured'));
            } else {
                console.log(chalk.yellow('No API key configured. Use: image-labeler config --api-key YOUR_KEY'));
            }
        }
    });

program
    .command('rename')
    .description('Rename image files using AI analysis')
    .argument('<path>', 'Image file, directory, or glob pattern')
    .option('--dry-run', 'Show what would be renamed without actually renaming')
    .option('--verbose', 'Show detailed processing information')
    .option('--webp', 'Convert images to WebP format while renaming')
    .action(async (path, options) => {
        try {
            await labeler.processImages(path, options);
        } catch (error) {
            console.error(chalk.red('Error:', error.message));
            process.exit(1);
        }
    });

program
    .command('single')
    .description('Rename a single image file')
    .argument('<file>', 'Image file to rename')
    .option('--dry-run', 'Show what would be renamed without actually renaming')
    .option('--webp', 'Convert image to WebP format while renaming')
    .action(async (file, options) => {
        try {
            await labeler.processImages(file, options);
        } catch (error) {
            console.error(chalk.red('Error:', error.message));
            process.exit(1);
        }
    });

program.parse();