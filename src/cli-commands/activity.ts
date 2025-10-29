import { Command } from 'commander'
import { findActivity } from '../tools/find-activity.js'
import { getTodoistClient, outputResult, handleError } from '../cli-helpers.js'

export function registerActivityCommands(program: Command) {
	const activity = program
		.command('activity')
		.description('View activity logs and audit history')
		.addHelpText(
			'after',
			`
Available Commands:
  find        Find activity logs

Examples:
  $ todoist activity find --object-type task --object-id 12345
  $ todoist activity find --event-type completed --limit 20
`,
		)

	// activity find
	activity
		.command('find')
		.description('Find activity logs for monitoring and auditing')
		.option('--object-type <type>', 'Object type: task, project, comment')
		.option('--object-id <id>', 'Specific object ID')
		.option(
			'--event-type <type>',
			'Event type: added, updated, deleted, completed, uncompleted, archived, unarchived, shared, left',
		)
		.option('--project-id <projectId>', 'Filter by project')
		.option('--task-id <taskId>', 'Filter by task')
		.option('--initiator-id <initiatorId>', 'Filter by user who initiated the action')
		.option('--limit <limit>', 'Maximum results (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Pagination cursor')
		.addHelpText(
			'after',
			`
Shows who did what and when. No date-based filtering (API limitation).

Examples:
  # Get all activity
  $ todoist activity find

  # Get activity for a specific task
  $ todoist activity find --object-type task --object-id 12345

  # Get all completed tasks activity
  $ todoist activity find --event-type completed

  # Get activity in a project
  $ todoist activity find --project-id 67890

  # Get activity by specific user
  $ todoist activity find --initiator-id 11111

  # Combine filters
  $ todoist activity find --object-type task --event-type updated --limit 20
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const params: any = {}

				if (options.objectType) params.objectType = options.objectType
				if (options.objectId) params.objectId = options.objectId
				if (options.eventType) params.eventType = options.eventType
				if (options.projectId) params.projectId = options.projectId
				if (options.taskId) params.taskId = options.taskId
				if (options.initiatorId) params.initiatorId = options.initiatorId
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findActivity.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
