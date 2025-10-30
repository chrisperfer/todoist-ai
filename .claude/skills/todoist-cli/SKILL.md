---
name: todoist-cli
description: Use when working with Todoist via the todoist CLI - teaches efficient CLI usage through progressive disclosure, context-saving patterns, and best practices for LLM integration
---

# Using the Todoist CLI Efficiently

## Overview

The todoist CLI provides a **progressive disclosure** interface designed specifically for LLM context efficiency. Instead of exposing all 24 tools at once (~5,700 tokens), it uses a three-level hierarchy that saves 90%+ context.

## When to Use This Skill

Use this skill when:
- User wants to interact with their Todoist account
- You need to query, create, update, or delete Todoist items
- User asks about tasks, projects, sections, comments, or collaborators
- You need to search across Todoist data

## Progressive Disclosure Pattern

**ALWAYS follow this pattern:**

### Level 1: Start with Overview
```bash
todoist --help
```
Shows resource groups (~50 tokens). Use this to discover available capabilities.

### Level 2: Explore Resource Groups
```bash
todoist tasks --help
todoist projects --help
todoist search --help
```
Shows operations for a specific resource (~200 tokens). Use this to find the right operation.

### Level 3: Get Operation Details
```bash
todoist tasks add --help
todoist tasks find --help
```
Shows parameters and examples for specific operations (~400 tokens). Use this only when ready to execute.

## Available Resources

The CLI organizes operations by resource type:

- **tasks**: add, update, complete, find, find-by-date, find-completed
- **projects**: add, update, find
- **sections**: add, update, find
- **comments**: add, update, find
- **collaborators**: find
- **assignments**: manage (bulk assign/unassign/reassign)
- **activity**: find (audit logs)
- **search**: query, fetch (OpenAI MCP compatible)
- **delete**: Universal deletion (tasks, projects, sections, comments)
- **overview**: Markdown overview of account or specific project
- **user**: Get user information and settings

## Authentication

The CLI requires a Todoist API token. Check for the `TODOIST_API_TOKEN` environment variable, or pass it with `--token`:

```bash
# Using environment variable (preferred)
export TODOIST_API_TOKEN="your-token-here"
todoist tasks find --search "urgent"

# Passing token directly
todoist --token "your-token-here" tasks find --search "urgent"
```

Get tokens from: https://todoist.com/app/settings/integrations/developer

## Context-Efficient Workflow

**DO:**
1. Start with `todoist overview` to understand account structure
2. Use `todoist search query "keywords"` for quick discovery
3. Request `--help` only at the level you need
4. Use `--json` flag when you need to parse output programmatically

**DON'T:**
1. Request all help documentation at once
2. Skip the overview when unfamiliar with the account
3. Use verbose commands when search would be faster
4. Parse human-readable output (use `--json` instead)

## Common Patterns

### Quick Task Operations

```bash
# Add a single task
todoist tasks add --content "Review PR #123" --priority p1 --due "tomorrow"

# Find today's tasks
todoist tasks find-by-date --start today

# Complete a task
todoist tasks complete --ids 123456789

# Find tasks with filters
todoist tasks find --project-id 12345 --labels "urgent,bug" --assignee "user@example.com"
```

### Batch Operations

```bash
# Batch add tasks (efficient for multiple items)
todoist tasks add --batch '[
  {"content":"Task 1","priority":"p1"},
  {"content":"Task 2","projectId":"12345"}
]'

# Bulk assignment operations
todoist assignments manage --operation assign --task-ids 123,456,789 --user "john@example.com"
```

### Project Management

```bash
# Create a project
todoist projects add --name "New Project" --favorite

# Find projects
todoist projects find --query "work"

# Get project overview
todoist overview --project-id 12345
```

### Search and Discovery

```bash
# Search across everything
todoist search query "meeting notes"

# Get account overview
todoist overview

# Find completed tasks
todoist tasks find-completed --start "2024-01-01"
```

## Output Formats

**Human-Readable (Default):**
```bash
todoist tasks find --search "urgent"
```
Use for user-facing results.

**JSON (For Parsing):**
```bash
todoist tasks find --search "urgent" --json
```
ALWAYS use `--json` when you need to parse the output or extract specific fields.

## Priority Levels

When working with priorities:
- `p1` = Priority 4 (Highest/Urgent) - Red
- `p2` = Priority 3 (High) - Orange
- `p3` = Priority 2 (Medium) - Yellow
- `p4` or no priority = Priority 1 (Normal) - No color

## Date Formats

The CLI accepts flexible date formats:
- Relative: "today", "tomorrow", "next week"
- Absolute: "2024-12-25", "Dec 25"
- Natural language via Todoist's API

## Error Handling

If a command fails:
1. Check authentication (is `TODOIST_API_TOKEN` set?)
2. Verify IDs exist (use `find` commands to discover IDs)
3. Check required parameters (use `--help` for the specific command)
4. Ensure proper quoting for strings with spaces

## Tips for LLM Integration

1. **Start broad, drill down**: Don't request detailed help until you know which command you need
2. **Use JSON for parsing**: Always add `--json` when extracting data
3. **Leverage search**: `todoist search query` is often faster than drilling through resource hierarchies
4. **Get context first**: Use `todoist overview` before making complex queries
5. **Batch when possible**: Use batch operations for multiple items
6. **Check help incrementally**: Request help one level at a time

## Example Workflows

### Creating a Task with Context

```bash
# First, understand the account
todoist overview

# Find the right project
todoist projects find --query "work"

# Add task to the project
todoist tasks add --content "Implement feature X" --project-id 12345 --priority p1 --due "friday"
```

### Finding and Updating Tasks

```bash
# Search for relevant tasks
todoist tasks find --search "review" --json

# Update a specific task
todoist tasks update --ids 123456 --content "Review PR #456 (updated)" --priority p2
```

### Managing Project Structure

```bash
# Get project overview
todoist overview --project-id 12345

# Add a section
todoist sections add --project-id 12345 --name "In Progress"

# Find sections
todoist sections find --project-id 12345 --json
```

## Summary

**Key Principles:**
- Progressive disclosure: Start at Level 1, drill down as needed
- Context efficiency: Only request help when necessary
- Use JSON output: When parsing programmatically
- Batch operations: For multiple items
- Search first: Often faster than hierarchical navigation

**Common First Steps:**
1. `todoist overview` - Understand the account
2. `todoist search query "keywords"` - Quick discovery
3. `todoist [resource] --help` - Explore capabilities
4. `todoist [resource] [operation] --help` - Get parameter details

By following these patterns, you'll minimize context usage while maximizing effectiveness with the Todoist CLI.
