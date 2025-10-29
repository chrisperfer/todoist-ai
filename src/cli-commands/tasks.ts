import { Command } from 'commander'
import { addTasks } from '../tools/add-tasks.js'
import { updateTasks } from '../tools/update-tasks.js'
import { completeTasks } from '../tools/complete-tasks.js'
import { findTasks } from '../tools/find-tasks.js'
import { findTasksByDate } from '../tools/find-tasks-by-date.js'
import { findCompletedTasks } from '../tools/find-completed-tasks.js'
import { getTodoistClient, outputResult, handleError, parseArray, parseJSON } from '../cli-helpers.js'

export function registerTasksCommands(program: Command) {
	const tasks = program
		.command('tasks')
		.description('Manage Todoist tasks')
		.addHelpText(
			'after',
			`
Available Commands:
  add              Add one or more tasks
  update           Update existing tasks
  complete         Mark tasks as completed
  find             Find tasks by search criteria
  find-by-date     Find tasks by due date range
  find-completed   Find completed tasks

Examples:
  $ todoist tasks add --content "Review PR #123"
  $ todoist tasks find --search "urgent" --labels "work"
  $ todoist tasks find-by-date --start today --days 7
`,
		)

	// tasks add
	tasks
		.command('add')
		.description('Add one or more tasks to Todoist')
		.option('--content <content>', 'Task name/title (required, supports Markdown)')
		.option('--description <description>', 'Additional details (supports Markdown)')
		.option('--due <due>', 'Due date in natural language (e.g., "tomorrow", "next Monday")')
		.option('--deadline <deadline>', 'Deadline date in ISO 8601 (YYYY-MM-DD)')
		.option('--duration <duration>', 'Task duration (e.g., "2h", "90m", "2h30m")')
		.option('--project-id <projectId>', 'Project ID to add task to')
		.option('--section-id <sectionId>', 'Section ID to add task to')
		.option('--parent-id <parentId>', 'Parent task ID (for subtasks)')
		.option('--priority <priority>', 'Priority: p1 (highest), p2, p3, p4 (default)')
		.option('--labels <labels>', 'Labels to attach (comma-separated)', parseArray)
		.option('--assign <assign>', 'Assign to user (ID, name, or email)')
		.option('--batch <json>', 'JSON array of tasks to create multiple at once')
		.addHelpText(
			'after',
			`
Examples:
  # Add a simple task
  $ todoist tasks add --content "Review PR #123"

  # Add with due date and priority
  $ todoist tasks add --content "Call dentist" --due "tomorrow at 2pm" --priority p1

  # Add to specific project with labels
  $ todoist tasks add --content "Write docs" --project-id 12345 --labels "docs,urgent"

  # Add subtask
  $ todoist tasks add --content "Research options" --parent-id 98765

  # Batch add from JSON
  $ todoist tasks add --batch '[{"content":"Task 1"},{"content":"Task 2"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				// Handle batch mode
				if (options.batch) {
					const tasksArray = parseJSON(options.batch, 'batch')
					const result = await addTasks.execute({ tasks: tasksArray }, client)
					outputResult(command, result)
					return
				}

				// Single task mode - validate required fields
				if (!options.content) {
					throw new Error('--content is required when not using --batch')
				}

				// Build task object from options
				const task: any = {
					content: options.content,
				}

				if (options.description) task.description = options.description
				if (options.due) task.dueString = options.due
				if (options.deadline) task.deadlineDate = options.deadline
				if (options.duration) task.duration = options.duration
				if (options.projectId) task.projectId = options.projectId
				if (options.sectionId) task.sectionId = options.sectionId
				if (options.parentId) task.parentId = options.parentId
				if (options.priority) task.priority = options.priority
				if (options.labels) task.labels = options.labels
				if (options.assign) task.responsibleUser = options.assign

				const result = await addTasks.execute({ tasks: [task] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// tasks update
	tasks
		.command('update')
		.description('Update existing tasks')
		.option('--id <id>', 'Task ID to update (required)')
		.option('--content <content>', 'New task name/title')
		.option('--description <description>', 'New description')
		.option('--due <due>', 'New due date in natural language')
		.option('--deadline <deadline>', 'New deadline date (YYYY-MM-DD)')
		.option('--duration <duration>', 'New duration (e.g., "2h")')
		.option('--project-id <projectId>', 'Move to project')
		.option('--section-id <sectionId>', 'Move to section')
		.option('--parent-id <parentId>', 'Move to parent task')
		.option('--priority <priority>', 'New priority (p1-p4)')
		.option('--labels <labels>', 'New labels (comma-separated)', parseArray)
		.option('--assign <assign>', 'Assign to user (or "unassign")')
		.option('--batch <json>', 'JSON array of task updates')
		.addHelpText(
			'after',
			`
Examples:
  # Update task content
  $ todoist tasks update --id 12345 --content "Updated title"

  # Change priority and due date
  $ todoist tasks update --id 12345 --priority p1 --due "tomorrow"

  # Move task to different project
  $ todoist tasks update --id 12345 --project-id 67890

  # Unassign task
  $ todoist tasks update --id 12345 --assign unassign
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				// Handle batch mode
				if (options.batch) {
					const tasksArray = parseJSON(options.batch, 'batch')
					const result = await updateTasks.execute({ tasks: tasksArray }, client)
					outputResult(command, result)
					return
				}

				// Single task mode - validate required fields
				if (!options.id) {
					throw new Error('--id is required when not using --batch')
				}

				// Build task update object from options
				const task: any = {
					id: options.id,
				}

				if (options.content) task.content = options.content
				if (options.description) task.description = options.description
				if (options.due) task.dueString = options.due
				if (options.deadline) task.deadlineDate = options.deadline
				if (options.duration) task.duration = options.duration
				if (options.projectId) task.projectId = options.projectId
				if (options.sectionId) task.sectionId = options.sectionId
				if (options.parentId) task.parentId = options.parentId
				if (options.priority) task.priority = options.priority
				if (options.labels) task.labels = options.labels
				if (options.assign) task.responsibleUser = options.assign

				const result = await updateTasks.execute({ tasks: [task] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// tasks complete
	tasks
		.command('complete')
		.description('Mark tasks as completed')
		.option('--ids <ids>', 'Task IDs to complete (comma-separated)', parseArray)
		.addHelpText(
			'after',
			`
Examples:
  # Complete a single task
  $ todoist tasks complete --ids 12345

  # Complete multiple tasks
  $ todoist tasks complete --ids "12345,67890,11111"
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (!options.ids) {
					throw new Error('--ids is required')
				}

				const result = await completeTasks.execute({ ids: options.ids }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// tasks find
	tasks
		.command('find')
		.description('Find tasks by search criteria')
		.option('--search <text>', 'Search text to find in tasks')
		.option('--project-id <projectId>', 'Find tasks in this project')
		.option('--section-id <sectionId>', 'Find tasks in this section')
		.option('--parent-id <parentId>', 'Find subtasks of this parent')
		.option('--assigned-to <user>', 'Find tasks assigned to user (ID, name, or email)')
		.option(
			'--assignment-filter <filter>',
			'Assignment filter: assigned, unassignedOrMe, all (default: unassignedOrMe)',
		)
		.option('--labels <labels>', 'Filter by labels (comma-separated)', parseArray)
		.option('--labels-operator <operator>', 'Labels operator: and, or (default: and)')
		.option('--limit <limit>', 'Maximum number of tasks to return (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Cursor for pagination')
		.addHelpText(
			'after',
			`
At least one filter must be provided.

Examples:
  # Search for tasks containing "urgent"
  $ todoist tasks find --search "urgent"

  # Find all tasks in a project
  $ todoist tasks find --project-id 12345

  # Find tasks with specific labels (both labels required)
  $ todoist tasks find --labels "work,urgent" --labels-operator and

  # Find tasks assigned to a user
  $ todoist tasks find --assigned-to "john@example.com"

  # Combine filters
  $ todoist tasks find --project-id 12345 --search "review" --labels "priority"
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				// Build find parameters
				const params: any = {}

				if (options.search) params.searchText = options.search
				if (options.projectId) params.projectId = options.projectId
				if (options.sectionId) params.sectionId = options.sectionId
				if (options.parentId) params.parentId = options.parentId
				if (options.assignedTo) params.responsibleUser = options.assignedTo
				if (options.assignmentFilter) params.responsibleUserFiltering = options.assignmentFilter
				if (options.labels) params.labels = options.labels
				if (options.labelsOperator) params.labelsOperator = options.labelsOperator
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findTasks.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// tasks find-by-date
	tasks
		.command('find-by-date')
		.description('Find tasks by due date range')
		.option('--start <date>', 'Start date: "today" or YYYY-MM-DD (default: today)')
		.option(
			'--overdue <option>',
			'Overdue handling: overdue-only, include-overdue, exclude-overdue (default: include-overdue for today)',
		)
		.option('--days <days>', 'Number of days from start (1-30, default: 1)', parseInt)
		.option('--assigned-to <user>', 'Filter by assigned user')
		.option('--labels <labels>', 'Filter by labels (comma-separated)', parseArray)
		.option('--limit <limit>', 'Maximum results (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Pagination cursor')
		.addHelpText(
			'after',
			`
Examples:
  # Get today's tasks (includes overdue by default)
  $ todoist tasks find-by-date --start today

  # Get next 7 days of tasks
  $ todoist tasks find-by-date --start today --days 7

  # Get only overdue tasks
  $ todoist tasks find-by-date --start today --overdue overdue-only

  # Get tasks for specific date range
  $ todoist tasks find-by-date --start 2025-01-15 --days 14
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const params: any = {}

				if (options.start) params.startDate = options.start
				if (options.overdue) params.overdueOption = options.overdue
				if (options.days) params.daysCount = options.days
				if (options.assignedTo) params.responsibleUser = options.assignedTo
				if (options.labels) params.labels = options.labels
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findTasksByDate.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// tasks find-completed
	tasks
		.command('find-completed')
		.description('Find completed tasks')
		.option('--get-by <field>', 'Search by: completion or due (default: completion)')
		.option('--since <date>', 'Start date (YYYY-MM-DD)')
		.option('--until <date>', 'End date (YYYY-MM-DD)')
		.option('--project-id <projectId>', 'Filter by project')
		.option('--section-id <sectionId>', 'Filter by section')
		.option('--parent-id <parentId>', 'Filter by parent task')
		.option('--assigned-to <user>', 'Filter by assigned user')
		.option('--labels <labels>', 'Filter by labels (comma-separated)', parseArray)
		.option('--limit <limit>', 'Maximum results (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Pagination cursor')
		.addHelpText(
			'after',
			`
Examples:
  # Get tasks completed in last week
  $ todoist tasks find-completed --since 2025-01-20 --until 2025-01-27

  # Get completed tasks by original due date
  $ todoist tasks find-completed --get-by due --since 2025-01-01

  # Get completed tasks in a project
  $ todoist tasks find-completed --project-id 12345 --since 2025-01-01
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const params: any = {}

				if (options.getBy) params.getBy = options.getBy
				if (options.since) params.since = options.since
				if (options.until) params.until = options.until
				if (options.projectId) params.projectId = options.projectId
				if (options.sectionId) params.sectionId = options.sectionId
				if (options.parentId) params.parentId = options.parentId
				if (options.assignedTo) params.responsibleUser = options.assignedTo
				if (options.labels) params.labels = options.labels
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findCompletedTasks.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
