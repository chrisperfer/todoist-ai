import { Command } from 'commander'
import { deleteObject } from '../tools/delete-object.js'
import { getOverview } from '../tools/get-overview.js'
import { userInfo } from '../tools/user-info.js'
import { getTodoistClient, outputResult, handleError } from '../cli-helpers.js'

export function registerStandaloneCommands(program: Command) {
	// delete command
	program
		.command('delete')
		.description('Delete any object (task, project, section, or comment)')
		.option('--type <type>', 'Object type: task, project, section, comment (required)')
		.option('--id <id>', 'Object ID to delete (required)')
		.addHelpText(
			'after',
			`
Examples:
  # Delete a task
  $ todoist delete --type task --id 12345

  # Delete a project (cascades to tasks/sections)
  $ todoist delete --type project --id 67890

  # Delete a section
  $ todoist delete --type section --id 11111

  # Delete a comment
  $ todoist delete --type comment --id 22222
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (!options.type) {
					throw new Error('--type is required')
				}
				if (!options.id) {
					throw new Error('--id is required')
				}

				const result = await deleteObject.execute(
					{
						type: options.type,
						id: options.id,
					},
					client,
				)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// overview command
	program
		.command('overview')
		.description('Get a Markdown overview of your account or a specific project')
		.option('--project-id <projectId>', 'Project ID (omit for account overview)')
		.addHelpText(
			'after',
			`
Examples:
  # Get account overview (all projects)
  $ todoist overview

  # Get specific project overview with all tasks
  $ todoist overview --project-id 12345
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const params: any = {}
				if (options.projectId) params.projectId = options.projectId

				const result = await getOverview.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// user command
	program
		.command('user')
		.description('Get your user information and settings')
		.addHelpText(
			'after',
			`
Returns: user ID, name, email, timezone, week settings, goals, and plan type.

Examples:
  # Get user info
  $ todoist user

  # Get user info as JSON
  $ todoist user --json
`,
		)
		.action(async function () {
			try {
				const client = getTodoistClient(this)
				const result = await userInfo.execute({}, client)
				outputResult(this, result)
			} catch (error) {
				handleError(error)
			}
		})
}
