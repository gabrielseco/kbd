# kbd

A TypeScript CLI tool built with Bun for interacting with the Anthropic API. Simple interface to chat with Claude models with configurable model selection and token limits.

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Anthropic API key

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Configure API key:**

   Create a `.env` file in the project root and add your Anthropic API key:
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

### Basic Chat

```bash
bun run chat "your message here"
```

### Model Selection

```bash
# Use Claude Haiku (fastest)
bun run chat -m haiku "quick response"

# Use Claude Sonnet (balanced, default)
bun run chat --model sonnet "your question"
```

### Token Limits

```bash
# Set custom max tokens
bun run chat -t 1000 "quick response"
```

### Save to Markdown

Save responses to markdown files in the `output/` directory:

```bash
# Auto-generate filename from question
bun run chat "difference between DCA and lump sum investing"

# Specify custom filename
bun run chat -o dca-vs-lumpsum.md "difference between DCA and lump sum investing"
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--model` | `-m` | Choose model: `sonnet` or `haiku` | `sonnet` |
| `--tokens` | `-t` | Set max tokens | `4096` |
| `--output` | `-o` | Save to markdown file in output/ directory | - |
| `--help` | `-h` | Show help | - |

## Available Models

- **sonnet** - claude-3-5-sonnet-20241022 (balanced, default)
- **haiku** - claude-3-5-haiku-20241022 (fastest)

## Features

- 🚀 Streaming responses for real-time output
- 📝 Save conversations to markdown files
- ⚡ Fast execution with Bun runtime
- 🎯 Simple CLI interface with sensible defaults
