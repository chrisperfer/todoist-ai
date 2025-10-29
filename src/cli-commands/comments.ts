import { Command } from 'commander'
import { addComments } from '../tools/add-comments.js'
import { updateComments } from '../tools/update-comments.js'
import { findComments } from '../tools/find-comments.js'
import { getTodoistClient, outputResult, handleError, parseJSON } from '../cli-helpers.js'

export function registerCommentsCommands(program: Command) {
	const comments = program
		.command('comments')
		.description('Manage comments on tasks and projects')
		.addHelpText(
			'after',
			`
Available Commands:
  add         Add one or more comments
  update      Update existing comments
  find        Find comments

Examples:
  $ todoist comments add --task-id 12345 --content "Great progress!"
  $ todoist comments find --task-id 12345
  $ todoist comments update --id 67890 --content "Updated comment"
`,
		)

	// comments add
	comments
		.command('add')
		.description('Add comments to tasks or projects')
		.option('--task-id <taskId>', 'Task ID to comment on')
		.option('--project-id <projectId>', 'Project ID to comment on')
		.option('--content <content>', 'Comment content (required)')
		.option('--batch <json>', 'JSON array of comments to create')
		.addHelpText(
			'after',
			`
You must specify either --task-id OR --project-id (not both).

Examples:
  # Add comment to a task
  $ todoist comments add --task-id 12345 --content "Great work!"

  # Add comment to a project
  $ todoist comments add --project-id 67890 --content "Project update"

  # Batch add comments
  $ todoist comments add --batch '[{"taskId":"123","content":"Comment 1"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const commentsArray = parseJSON(options.batch, 'batch')
					const result = await addComments.execute({ comments: commentsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.content) {
					throw new Error('--content is required when not using --batch')
				}

				if (options.taskId && options.projectId) {
					throw new Error('Specify either --task-id OR --project-id, not both')
				}

				if (!options.taskId && !options.projectId) {
					throw new Error('Either --task-id or --project-id is required')
				}

				const comment: any = {
					content: options.content,
				}

				if (options.taskId) comment.taskId = options.taskId
				if (options.projectId) comment.projectId = options.projectId

				const result = await addComments.execute({ comments: [comment] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// comments update
	comments
		.command('update')
		.description('Update existing comments')
		.option('--id <id>', 'Comment ID to update (required)')
		.option('--content <content>', 'New comment content (required)')
		.option('--batch <json>', 'JSON array of comment updates')
		.addHelpText(
			'after',
			`
Examples:
  # Update a comment
  $ todoist comments update --id 67890 --content "Updated content"

  # Batch update
  $ todoist comments update --batch '[{"id":"123","content":"New content"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const commentsArray = parseJSON(options.batch, 'batch')
					const result = await updateComments.execute({ comments: commentsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.id) {
					throw new Error('--id is required when not using --batch')
				}
				if (!options.content) {
					throw new Error('--content is required when not using --batch')
				}

				const comment: any = {
					id: options.id,
					content: options.content,
				}

				const result = await updateComments.execute({ comments: [comment] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// comments find
	comments
		.command('find')
		.description('Find comments')
		.option('--task-id <taskId>', 'Find comments on this task')
		.option('--project-id <projectId>', 'Find comments on this project')
		.option('--comment-id <commentId>', 'Get specific comment by ID')
		.option('--limit <limit>', 'Maximum results (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Pagination cursor')
		.addHelpText(
			'after',
			`
You must specify exactly one of: --task-id, --project-id, or --comment-id.

Examples:
  # Find comments on a task
  $ todoist comments find --task-id 12345

  # Find comments on a project
  $ todoist comments find --project-id 67890

  # Get a specific comment
  $ todoist comments find --comment-id 11111
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const filters = [options.taskId, options.projectId, options.commentId].filter(Boolean)

				if (filters.length === 0) {
					throw new Error('One of --task-id, --project-id, or --comment-id is required')
				}

				if (filters.length > 1) {
					throw new Error('Specify only one of: --task-id, --project-id, or --comment-id')
				}

				const params: any = {}

				if (options.taskId) params.taskId = options.taskId
				if (options.projectId) params.projectId = options.projectId
				if (options.commentId) params.commentId = options.commentId
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findComments.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
