# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript CLI tool built with Bun for interacting with the Anthropic API. The tool provides a simple interface to chat with Claude models with configurable model selection and token limits.

## Setup

1. Install dependencies: `bun install`
2. Set up API key: Copy `.env.example` to `.env` and add your Anthropic API key
3. Run the chat tool: `bun run chat "your message here"`

## Commands

**Chat with Claude:**
```bash
bun run chat "your message"
bun run chat --model opus "complex question"
bun run chat -m haiku -t 1000 "quick response"
```

**Save responses to markdown files:**
```bash
# Auto-generate filename from question
bun run chat "difference between DCA and lump sum investing"

# Specify custom filename
bun run chat -o dca-vs-lumpsum.md "difference between DCA and lump sum investing"
```

**Available options:**
- `-m, --model`: Choose model (opus, sonnet, haiku) [default: sonnet]
- `-t, --tokens`: Set max tokens [default: 4096]
- `-o, --output`: Save to markdown file in output/ directory
- `-h, --help`: Show help

## Architecture

- `src/chat.ts` - Main CLI script that handles argument parsing, API configuration, and streaming responses from Anthropic API
- Supports streaming responses for real-time output
- Model shortcuts map to full Anthropic model identifiers
- Environment-based API key configuration

## Available Models

- `opus` - claude-3-opus-20240229 (most capable)
- `sonnet` - claude-3-5-sonnet-20241022 (balanced, default)
- `haiku` - claude-3-5-haiku-20241022 (fastest)