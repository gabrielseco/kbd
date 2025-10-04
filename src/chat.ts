#!/usr/bin/env bun

import Anthropic from '@anthropic-ai/sdk';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_MAX_TOKENS = 2000;
const OUTPUT_DIR = 'kbd';

// Available models
const AVAILABLE_MODELS = {
  'sonnet': 'claude-sonnet-4-5-20250929',
  'sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'sonnet-3.5': 'claude-3-5-sonnet-20241022',
  'haiku': 'claude-3-5-haiku-20241022',
  'haiku-3.5': 'claude-3-5-haiku-20241022',
} as const;

// Parse command line arguments
const args = process.argv.slice(2);
let model = DEFAULT_MODEL;
let maxTokens = DEFAULT_MAX_TOKENS;
let message = '';
let outputFile = '';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--model' || arg === '-m') {
    const modelArg = args[++i]?.toLowerCase();
    model = AVAILABLE_MODELS[modelArg as keyof typeof AVAILABLE_MODELS] || modelArg || DEFAULT_MODEL;
  } else if (arg === '--tokens' || arg === '-t') {
    maxTokens = parseInt(args[++i]) || DEFAULT_MAX_TOKENS;
  } else if (arg === '--output' || arg === '-o') {
    outputFile = args[++i];
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: bun run chat.ts [options] <message>

Options:
  -m, --model <model>    Model to use (sonnet, sonnet-3.5, haiku) [default: sonnet-4.5]
  -t, --tokens <number>  Max tokens [default: ${DEFAULT_MAX_TOKENS}]
  -o, --output <file>    Save output to markdown file in output/ directory
  -h, --help            Show this help message

Available models:
  sonnet     - claude-sonnet-4-5-20250929 (most capable, default)
  sonnet-3.5 - claude-3-5-sonnet-20241022 (previous version)
  haiku      - claude-3-5-haiku-20241022 (fastest)

Environment variables:
  ANTHROPIC_API_KEY     Your Anthropic API key (required)

Examples:
  bun run chat.ts "Hello, Claude!"
  bun run chat.ts --model sonnet-3.5 "Explain quantum computing"
  bun run chat.ts -m haiku -t 1000 "Quick summary of AI"
  bun run chat.ts -o dca-vs-lumpsum.md "difference between DCA and lump sum investing"
`);
    process.exit(0);
  } else {
    message = args.slice(i).join(' ');
    break;
  }
}

// Validate inputs
if (!ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
  console.error('Set it with: export ANTHROPIC_API_KEY=your_api_key');
  process.exit(1);
}

if (!message) {
  console.error('Error: No message provided');
  console.error('Usage: bun run chat.ts [options] <message>');
  console.error('Run with --help for more information');
  process.exit(1);
}

// Initialize client
const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Generate filename from message
function generateFilename(msg: string): string {
  const sanitized = msg
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${sanitized}.md`;
}

// Make API call
async function chat() {
  try {
    console.log(`\nModel: ${model}`);
    console.log(`Max tokens: ${maxTokens}`);
    console.log(`\nUser: ${message}\n`);
    console.log('Claude:');

    const stream = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        process.stdout.write(text);
        fullResponse += text;
      }
    }

    console.log('\n');

    // Save to file if output flag is used
    if (outputFile || fullResponse) {
      const filename = outputFile || generateFilename(message);
      const filepath = join(OUTPUT_DIR, filename);

      // Create output directory if it doesn't exist
      const outputPath = filepath.substring(0, filepath.lastIndexOf('/'));
      if (!existsSync(outputPath)) {
        await mkdir(outputPath, { recursive: true });
      }

      // Create markdown content with frontmatter metadata
      const timestamp = new Date().toISOString();
      const markdownContent = `---
prompt: "${message}"
model: ${model}
max_tokens: ${maxTokens}
timestamp: ${timestamp}
---

${fullResponse}
`;

      await writeFile(filepath, markdownContent);
      console.log(`\n✓ Saved to ${filepath}`);
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`\nAPI Error: ${error.message}`);
      console.error(`Status: ${error.status}`);
    } else {
      console.error('\nError:', error);
    }
    process.exit(1);
  }
}

chat();