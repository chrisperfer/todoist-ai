import { Command } from 'commander'
import { manageAssignments } from '../tools/manage-assignments.js'
import { getTodoistClient, outputResult, handleError, parseArray } from '../cli-helpers.js'

export function registerAssignmentsCommands(program: Command) {
	const assignments = program
		.command('assignments')
		.description('Bulk assign/unassign/reassign tasks')
		.addHelpText(
			'after',
			`
Available Commands:
  manage      Bulk assignment operations

Examples:
  $ todoist assignments manage --operation assign --task-ids 123,456 --user john@example.com
  $ todoist assignments manage --operation unassign --task-ids 123,456
`,
		)

	// assignments manage
	assignments
		.command('manage')
		.description('Bulk assignment operations (assign/unassign/reassign)')
		.option(
			'--operation <operation>',
			'Operation: assign, unassign, reassign (required)',
		)
		.option('--task-ids <taskIds>', 'Task IDs (comma-separated, max 50, required)', parseArray)
		.option('--user <user>', 'User to assign to (ID, name, or email) - required for assign/reassign')
		.option('--from-user <fromUser>', 'Reassign only from this user (for reassign operation)')
		.option('--dry-run', 'Validate without making changes')
		.addHelpText(
			'after',
			`
Operations:
  assign      Assign tasks to a user
  unassign    Remove assignment from tasks
  reassign    Change assignment from one user to another

Examples:
  # Assign multiple tasks to a user
  $ todoist assignments manage --operation assign --task-ids 123,456,789 --user john@example.com

  # Unassign tasks
  $ todoist assignments manage --operation unassign --task-ids 123,456

  # Reassign tasks from one user to another
  $ todoist assignments manage --operation reassign --task-ids 123,456 --user jane@example.com --from-user john@example.com

  # Dry run to validate
  $ todoist assignments manage --operation assign --task-ids 123 --user john@example.com --dry-run
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (!options.operation) {
					throw new Error('--operation is required')
				}
				if (!options.taskIds) {
					throw new Error('--task-ids is required')
				}

				const params: any = {
					operation: options.operation,
					taskIds: options.taskIds,
				}

				if (options.user) params.responsibleUser = options.user
				if (options.fromUser) params.fromAssigneeUser = options.fromUser
				if (options.dryRun) params.dryRun = true

				const result = await manageAssignments.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
