#!/usr/bin/env node
import { Command } from 'commander'
import dotenv from 'dotenv'
import { TodoistApi } from '@doist/todoist-api-typescript'
import { registerTasksCommands } from './cli-commands/tasks.js'
import { registerProjectsCommands } from './cli-commands/projects.js'
import { registerSectionsCommands } from './cli-commands/sections.js'
import { registerCommentsCommands } from './cli-commands/comments.js'
import { registerSearchCommands } from './cli-commands/search.js'
import { registerStandaloneCommands } from './cli-commands/standalone.js'
import { registerCollaboratorsCommands } from './cli-commands/collaborators.js'
import { registerAssignmentsCommands } from './cli-commands/assignments.js'
import { registerActivityCommands } from './cli-commands/activity.js'

// Load environment variables
dotenv.config()

const program = new Command()

program
	.name('todoist')
	.description('Todoist CLI - Manage your Todoist tasks, projects, and more')
	.version('1.0.0')
	.option('--json', 'Output in JSON format')
	.option('--token <token>', 'Todoist API token (or use TODOIST_API_TOKEN env var)')
	.hook('preAction', (thisCommand) => {
		// Get the root command to access global options
		const rootCommand = thisCommand.parent || thisCommand
		const opts = rootCommand.opts()

		// Get token from flag or environment
		const token = opts.token || process.env.TODOIST_API_TOKEN

		if (!token) {
			console.error(
				'Error: Todoist API token not found. Please set TODOIST_API_TOKEN environment variable or use --token flag.',
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
