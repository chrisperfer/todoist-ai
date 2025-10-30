# Todoist AI and MCP SDK

Library for connecting AI agents to Todoist. Includes tools that can be integrated into LLMs,
enabling them to access and modify a Todoist account on the user's behalf.

These tools can be used both through an MCP server, or imported directly in other projects to
integrate them to your own AI conversational interfaces.

## Using tools

### 1. Add this repository as a dependency

```sh
npm install @doist/todoist-ai
```

### 2. Import the tools and plug them to an AI

Here's an example using [Vercel's AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/generating-text#streamtext).

```js
import { findTasksByDate, addTasks } from "@doist/todoist-ai";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { streamText } from "ai";

// Create Todoist API client
const client = new TodoistApi(process.env.TODOIST_API_KEY);

// Helper to wrap tools with the client
function wrapTool(tool, todoistClient) {
    return {
        ...tool,
        execute(args) {
            return tool.execute(args, todoistClient);
        },
    };
}

const result = streamText({
    model: yourModel,
    system: "You are a helpful Todoist assistant",
    tools: {
        findTasksByDate: wrapTool(findTasksByDate, client),
        addTasks: wrapTool(addTasks, client),
    },
});
```

## Using as an MCP server

### Quick Start

You can run the MCP server directly with npx:

```bash
npx @doist/todoist-ai
```

### Setup Guide

The Todoist AI MCP server is available as a streamable HTTP service for easy integration with various AI clients:

**Primary URL (Streamable HTTP):** `https://ai.todoist.net/mcp`

#### Claude Desktop

1. Open Settings → Connectors → Add custom connector
2. Enter `https://ai.todoist.net/mcp` and complete OAuth authentication

#### Cursor

Create a configuration file:
- **Global:** `~/.cursor/mcp.json`
- **Project-specific:** `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "todoist": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://ai.todoist.net/mcp"]
    }
  }
}
```

Then enable the server in Cursor settings if prompted.

#### Claude Code (CLI)

Firstly configure Claude so it has a new MCP available using this command:

```bash
claude mcp add --transport http todoist https://ai.todoist.net/mcp
```

Then launch `claude`, execute `/mcp`, then select the `todoist` MCP server.

This will take you through a wizard to authenticate using your browser with Todoist. Once complete you will be able to use todoist in `claude`.


#### Visual Studio Code

1. Open Command Palette → MCP: Add Server
2. Select HTTP transport and use:

```json
{
  "servers": {
    "todoist": {
      "type": "http",
      "url": "https://ai.todoist.net/mcp"
    }
  }
}
```

#### Other MCP Clients

```bash
npx -y mcp-remote https://ai.todoist.net/mcp
```

For more details on setting up and using the MCP server, including creating custom servers, see [docs/mcp-server.md](docs/mcp-server.md).

## Using as a CLI Tool

The Todoist CLI provides a command-line interface with **progressive disclosure** for efficient context usage with LLMs. Instead of exposing all 24 tools at once (consuming ~5,700 tokens), the CLI uses a hierarchical structure that reveals information only when needed.

### Benefits for LLM Integration

- **90%+ Context Savings**: LLMs only see relevant command information
- **Progressive Disclosure**: Three-level hierarchy (overview → resource group → specific operation)
- **Better Comprehension**: Focused help at each level improves LLM understanding
- **Efficient Exploration**: LLMs can discover capabilities without context overload

### Installation

```bash
npm install -g @doist/todoist-ai
```

Or use directly with npx:

```bash
npx @doist/todoist-ai
```

### Authentication

Set your Todoist API token as an environment variable:

```bash
export TODOIST_API_TOKEN="your-token-here"
```

Get your token from: https://todoist.com/app/settings/integrations/developer

Alternatively, pass it with each command:

```bash
todoist --token "your-token-here" tasks find --search "urgent"
```

### Progressive Disclosure in Action

**Level 1: Top-Level Overview** (~50 tokens)
```bash
todoist --help
```

Shows available resource groups: tasks, projects, sections, comments, etc.

**Level 2: Resource Group** (~200 tokens)
```bash
todoist tasks --help
```

Shows operations available for tasks: add, update, complete, find, etc.

**Level 3: Specific Operation** (~400 tokens)
```bash
todoist tasks add --help
```

Shows all parameters and examples for adding tasks.

### Command Structure

```
todoist
├── tasks (add, update, complete, find, find-by-date, find-completed)
├── projects (add, update, find)
├── sections (add, update, find)
├── comments (add, update, find)
├── collaborators (find)
├── assignments (manage)
├── activity (find)
├── search (query, fetch)
├── delete
├── overview
└── user
```

### Quick Examples

```bash
# Add a task
todoist tasks add --content "Review PR #123" --priority p1 --due "tomorrow"

# Find tasks in a project
todoist tasks find --project-id 12345 --labels "urgent,bug"

# Get today's tasks
todoist tasks find-by-date --start today

# Create a project
todoist projects add --name "New Project" --favorite

# Get account overview
todoist overview

# Search across everything
todoist search query "meeting notes"
```

### Output Formats

**Human-Readable (Default)**
```bash
todoist tasks find --search "urgent"
```

**JSON (for programmatic use)**
```bash
todoist tasks find --search "urgent" --json
```

### Batch Operations

Many commands support batch operations for efficiency:

```bash
# Batch add tasks from JSON
todoist tasks add --batch '[
  {"content":"Task 1","priority":"p1"},
  {"content":"Task 2","projectId":"12345"}
]'

# Bulk assignment operations
todoist assignments manage --operation assign --task-ids 123,456,789 --user "john@example.com"
```

### LLM Integration Tips

For AI assistants using this CLI:

1. **Start broad, drill down**: Use `--help` at each level to discover capabilities
2. **Context-efficient exploration**: Only request detailed help when needed
3. **Use JSON output**: Add `--json` flag for structured data parsing
4. **Leverage search**: Use `todoist search query` for quick discovery
5. **Get overview first**: Use `todoist overview` to understand account structure

### All Available Commands

- **tasks**: `add`, `update`, `complete`, `find`, `find-by-date`, `find-completed`
- **projects**: `add`, `update`, `find`
- **sections**: `add`, `update`, `find`
- **comments**: `add`, `update`, `find`
- **collaborators**: `find`
- **assignments**: `manage` (bulk assign/unassign/reassign)
- **activity**: `find` (audit logs)
- **search**: `query`, `fetch` (OpenAI MCP compatible)
- **delete**: Universal deletion (tasks, projects, sections, comments)
- **overview**: Markdown overview of account or specific project
- **user**: Get user information and settings

For detailed help on any command: `todoist [command] [subcommand] --help`

## Claude Code Plugin

This repository includes a Claude Code plugin that teaches AI assistants how to use the Todoist CLI efficiently. The plugin provides a skill with:

- **Progressive disclosure patterns**: How to navigate the 3-level CLI hierarchy efficiently
- **Context-saving strategies**: Request help only when needed (90%+ context savings)
- **Best practices**: Common workflows, batch operations, and JSON parsing
- **Error handling**: Authentication and troubleshooting guidance

### Installation

Add this repository as a marketplace, then install the plugin:

```bash
# Add the marketplace
/plugin marketplace add chrisperfer/todoist-ai

# Install the todoist-cli plugin
/plugin install todoist-cli@todoist-ai-marketplace
```

Alternatively, use the interactive menu:

```bash
/plugin
```

Then browse and select the `todoist-cli` plugin from the marketplace list.

### What It Does

Once installed, Claude will automatically use this skill when you ask about Todoist operations. The skill teaches Claude to:

1. Start with `todoist overview` to understand your account structure
2. Use `todoist search query` for quick discovery
3. Navigate the CLI hierarchy incrementally (don't load all help at once)
4. Use `--json` flag when parsing output programmatically
5. Leverage batch operations for multiple items

### Example Usage

After installing the plugin, you can ask Claude things like:

- "Show me my tasks for today"
- "Create a task in my Work project with priority 1"
- "Find all tasks labeled 'urgent' in the Engineering project"
- "Give me an overview of my Todoist account"

Claude will use the skill to efficiently navigate the CLI and execute the appropriate commands.

## Features

A key feature of this project is that tools can be reused, and are not written specifically for use in an MCP server. They can be hooked up as tools to other conversational AI interfaces (e.g. Vercel's AI SDK).

This project is in its early stages. Expect more and/or better tools soon.

Nevertheless, our goal is to provide a small set of tools that enable complete workflows, rather than just atomic actions, striking a balance between flexibility and efficiency for LLMs.

For our design philosophy, guidelines, and development patterns, see [docs/tool-design.md](docs/tool-design.md).

### Available Tools

For a complete list of available tools, see the [src/tools](src/tools) directory.

#### OpenAI MCP Compatibility

This server includes `search` and `fetch` tools that follow the [OpenAI MCP specification](https://platform.openai.com/docs/mcp), enabling seamless integration with OpenAI's MCP protocol. These tools return JSON-encoded results optimized for OpenAI's requirements while maintaining compatibility with the broader MCP ecosystem.

## Dependencies

-   MCP server using the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#installation)
-   Todoist Typescript API client [@doist/todoist-api-typescript](https://github.com/Doist/todoist-api-typescript)

## MCP Server Setup

See [docs/mcp-server.md](docs/mcp-server.md) for full instructions on setting up the MCP server.

## Local Development Setup

See [docs/dev-setup.md](docs/dev-setup.md) for full instructions on setting up this repository locally for development and contributing.

### Quick Start

After cloning and setting up the repository:

- `npm start` - Build and run the MCP inspector for testing
- `npm run dev` - Development mode with auto-rebuild and restart

## Releasing

This project uses [release-please](https://github.com/googleapis/release-please) to automate version management and package publishing.

### How it works

1. Make your changes using [Conventional Commits](https://www.conventionalcommits.org/):

    - `feat:` for new features (minor version bump)
    - `fix:` for bug fixes (patch version bump)
    - `feat!:` or `fix!:` for breaking changes (major version bump)
    - `docs:` for documentation changes
    - `chore:` for maintenance tasks
    - `ci:` for CI changes

2. When commits are pushed to `main`:

    - Release-please automatically creates/updates a release PR
    - The PR includes version bump and changelog updates
    - Review the PR and merge when ready

3. After merging the release PR:
    - A new GitHub release is automatically created
    - A new tag is created
    - The `publish` workflow is triggered
    - The package is published to npm
