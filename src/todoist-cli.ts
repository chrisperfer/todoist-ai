#!/usr/bin/env node
import { TodoistApi } from '@doist/todoist-api-typescript'
import { Command } from 'commander'
import dotenv from 'dotenv'
import { registerActivityCommands } from './cli-commands/activity.js'
import { registerAssignmentsCommands } from './cli-commands/assignments.js'
import { registerCollaboratorsCommands } from './cli-commands/collaborators.js'
import { registerCommentsCommands } from './cli-commands/comments.js'
import { registerProjectsCommands } from './cli-commands/projects.js'
import { registerSearchCommands } from './cli-commands/search.js'
import { registerSectionsCommands } from './cli-commands/sections.js'
import { registerStandaloneCommands } from './cli-commands/standalone.js'
import { registerTasksCommands } from './cli-commands/tasks.js'

// Load environment variables
dotenv.config()

const program = new Command()

program
    .name('todoist')
    .description('Todoist CLI - Manage your Todoist tasks, projects, and more')
    .version('1.0.0')
    .option('--json', 'Output in JSON format')
    .option('--token <token>', 'Todoist API token (or use TODOIST_API_KEY env var)')
    .hook('preAction', (thisCommand) => {
        // Get the root command to access global options
        // For nested subcommands, traverse up to the actual root
        let rootCommand = thisCommand
        while (rootCommand.parent) {
            rootCommand = rootCommand.parent
        }
        const opts = rootCommand.opts()

        // Get token from flag or environment
        const token = opts.token || process.env.TODOIST_API_KEY

        if (!token) {
            console.error(
                'Error: Todoist API token not found. Please set TODOIST_API_KEY environment variable or use --token flag.',
            )
            process.exit(1)
        }

        // Initialize Todoist API client and attach to command
        const baseUrl = process.env.TODOIST_BASE_URL
        const client = new TodoistApi(token, baseUrl)
        ;(thisCommand as any).todoistClient = client
        ;(thisCommand as any).outputJson = opts.json || false
    })

// Register command groups
registerTasksCommands(program)
registerProjectsCommands(program)
registerSectionsCommands(program)
registerCommentsCommands(program)
registerSearchCommands(program)
registerStandaloneCommands(program)
registerCollaboratorsCommands(program)
registerAssignmentsCommands(program)
registerActivityCommands(program)

// Parse command line arguments
program.parse(process.argv)
