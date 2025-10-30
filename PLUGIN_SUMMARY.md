# Todoist CLI Plugin - Ready to Publish

## What We Created

A Claude Code plugin that teaches AI assistants how to use the Todoist CLI efficiently through progressive disclosure patterns.

## Files Created

### Plugin Files (in this project)
- `.claude/skills/todoist-cli/SKILL.md` - The main skill file
- `.claude-plugin/plugin.json` - Plugin metadata
- `PLUGIN_README.md` - README for the plugin repository
- `PLUGIN_LICENSE.md` - MIT license
- `PLUGIN_GITIGNORE.md` - Git ignore file
- `PUBLISHING_GUIDE.md` - Complete publishing instructions
- `prepare-plugin-repo.sh` - Script to set up the plugin repository

## Quick Start: Publishing Your Plugin

### Option 1: Use the Preparation Script

```bash
cd /Users/chris/projects/todoist-ai

# Run the script (default location: ~/todoist-cli-plugin)
./prepare-plugin-repo.sh

# Or specify a custom location
./prepare-plugin-repo.sh ~/my-plugins/todoist-cli-plugin
```

Then follow the instructions printed by the script.

### Option 2: Manual Setup

See `PUBLISHING_GUIDE.md` for detailed step-by-step instructions.

## Key Information to Update

Before publishing, you need to update these fields in `.claude-plugin/plugin.json`:

1. **author.name**: Replace "Chris" with your name
2. **author.email**: Replace "your-email@example.com" with your email
3. **homepage**: Replace with your actual GitHub repository URL
4. **repository**: Replace with your actual GitHub repository URL

Example:
```json
{
  "author": {
    "name": "YourName",
    "email": "you@example.com"
  },
  "homepage": "https://github.com/yourusername/todoist-cli-plugin",
  "repository": "https://github.com/yourusername/todoist-cli-plugin"
}
```

## Publishing Checklist

- [ ] Run `prepare-plugin-repo.sh` or manually copy files
- [ ] Update author info in `.claude-plugin/plugin.json`
- [ ] Update URLs in `.claude-plugin/plugin.json`
- [ ] Update README.md with your information
- [ ] Create GitHub repository (must be **Public**)
- [ ] Initialize git and push to GitHub
- [ ] (Optional) Create a release on GitHub
- [ ] Test installation: `claude plugin add https://github.com/yourusername/todoist-cli-plugin`

## Installation (After Publishing)

Once published to GitHub, users can install with:

```bash
claude plugin add https://github.com/yourusername/todoist-cli-plugin
```

## What the Skill Does

The skill teaches Claude how to:

- Use the Todoist CLI's 3-level progressive disclosure hierarchy
- Save 90%+ context by requesting help only when needed
- Follow best practices for task management and project organization
- Use batch operations efficiently
- Parse output with JSON formatting
- Handle authentication and common errors

## Testing Locally

You mentioned you'll install the plugin the official way once done. Here's how:

1. First, complete the publishing steps above
2. Then install from your GitHub repository:
   ```bash
   claude plugin add https://github.com/yourusername/todoist-cli-plugin
   ```
3. Start a new Claude session and test:
   ```bash
   claude
   ```
4. Ask Claude: "How should I use the Todoist CLI?" - it should reference the skill

## Plugin Structure

```
todoist-cli-plugin/
├── .claude/
│   └── skills/
│       └── todoist-cli/
│           └── SKILL.md          # Main skill file with usage patterns
├── .claude-plugin/
│   └── plugin.json               # Plugin metadata
├── .gitignore
├── LICENSE                       # MIT license
└── README.md                     # Installation and usage instructions
```

## Support and Issues

After publishing, users can:
- Report issues at: `https://github.com/yourusername/todoist-cli-plugin/issues`
- View documentation in the README.md
- See examples in the SKILL.md file

## Next Steps

1. Run the preparation script or follow the publishing guide
2. Create your GitHub repository
3. Push the plugin files
4. Test the installation
5. Share with the community!

---

All files are ready. See `PUBLISHING_GUIDE.md` for complete step-by-step instructions.
