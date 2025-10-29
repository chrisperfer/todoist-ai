import { Command } from 'commander'
import { search } from '../tools/search.js'
import { fetch } from '../tools/fetch.js'
import { getTodoistClient, outputResult, handleError } from '../cli-helpers.js'

export function registerSearchCommands(program: Command) {
	const searchCmd = program
		.command('search')
		.description('Search across tasks and projects (OpenAI MCP compatible)')
		.addHelpText(
			'after',
			`
Available Commands:
  query       Search across tasks and projects
  fetch       Fetch full contents by ID

Examples:
  $ todoist search query "meeting notes"
  $ todoist search fetch "task:12345"
`,
		)

	// search query
	searchCmd
		.command('query')
		.description('Search across tasks and projects')
		.argument('<query>', 'Search query')
		.addHelpText(
			'after',
			`
Returns results with format: task:{id} or project:{id}

Examples:
  # Search for tasks and projects
  $ todoist search query "meeting"

  # Search with multiple words
  $ todoist search query "urgent bug fix"
`,
		)
		.action(async (query, _options, command) => {
			try {
				const client = getTodoistClient(command)
				const result = await search.execute({ query }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// search fetch
	searchCmd
		.command('fetch')
		.description('Fetch full contents of a task or project')
		.argument('<id>', 'ID in format "task:{id}" or "project:{id}"')
		.addHelpText(
			'after',
			`
Examples:
  # Fetch a task
  $ todoist search fetch "task:12345"

  # Fetch a project
  $ todoist search fetch "project:67890"
`,
		)
		.action(async (id, _options, command) => {
			try {
				const client = getTodoistClient(command)
				const result = await fetch.execute({ id }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
