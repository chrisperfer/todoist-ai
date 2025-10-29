import { Command } from 'commander'
import { findProjectCollaborators } from '../tools/find-project-collaborators.js'
import { getTodoistClient, outputResult, handleError } from '../cli-helpers.js'

export function registerCollaboratorsCommands(program: Command) {
	const collaborators = program
		.command('collaborators')
		.description('Find and manage project collaborators')
		.addHelpText(
			'after',
			`
Available Commands:
  find        Find collaborators in a project

Examples:
  $ todoist collaborators find --project-id 12345
  $ todoist collaborators find --project-id 12345 --search "john"
`,
		)

	// collaborators find
	collaborators
		.command('find')
		.description('Find collaborators in a project')
		.option('--project-id <projectId>', 'Project ID (required)')
		.option('--search <search>', 'Search by name or email (case-insensitive)')
		.addHelpText(
			'after',
			`
Returns collaborator IDs, names, and emails for assignment operations.

Examples:
  # List all collaborators in a project
  $ todoist collaborators find --project-id 12345

  # Search for specific collaborators
  $ todoist collaborators find --project-id 12345 --search "john"

  # Get collaborator info as JSON
  $ todoist collaborators find --project-id 12345 --json
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (!options.projectId) {
					throw new Error('--project-id is required')
				}

				const params: any = {
					projectId: options.projectId,
				}

				if (options.search) params.searchTerm = options.search

				const result = await findProjectCollaborators.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
