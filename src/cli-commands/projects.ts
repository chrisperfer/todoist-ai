import { Command } from 'commander'
import { addProjects } from '../tools/add-projects.js'
import { updateProjects } from '../tools/update-projects.js'
import { findProjects } from '../tools/find-projects.js'
import { getTodoistClient, outputResult, handleError, parseJSON } from '../cli-helpers.js'

export function registerProjectsCommands(program: Command) {
	const projects = program
		.command('projects')
		.description('Manage Todoist projects')
		.addHelpText(
			'after',
			`
Available Commands:
  add         Add one or more projects
  update      Update existing projects
  find        Find projects by name

Examples:
  $ todoist projects add --name "Work Projects"
  $ todoist projects find --search "work"
  $ todoist projects update --id 12345 --name "Updated Name"
`,
		)

	// projects add
	projects
		.command('add')
		.description('Add one or more projects')
		.option('--name <name>', 'Project name (required)')
		.option('--parent-id <parentId>', 'Parent project ID (for sub-projects)')
		.option('--favorite', 'Mark as favorite')
		.option('--view <view>', 'View style: list, board, calendar (default: list)')
		.option('--batch <json>', 'JSON array of projects to create')
		.addHelpText(
			'after',
			`
Examples:
  # Add a simple project
  $ todoist projects add --name "My New Project"

  # Add a favorite project with board view
  $ todoist projects add --name "Kanban Board" --favorite --view board

  # Add a sub-project
  $ todoist projects add --name "Sub-project" --parent-id 12345

  # Batch add projects
  $ todoist projects add --batch '[{"name":"Project 1"},{"name":"Project 2"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const projectsArray = parseJSON(options.batch, 'batch')
					const result = await addProjects.execute({ projects: projectsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.name) {
					throw new Error('--name is required when not using --batch')
				}

				const project: any = {
					name: options.name,
				}

				if (options.parentId) project.parentId = options.parentId
				if (options.favorite) project.isFavorite = true
				if (options.view) project.viewStyle = options.view

				const result = await addProjects.execute({ projects: [project] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// projects update
	projects
		.command('update')
		.description('Update existing projects')
		.option('--id <id>', 'Project ID to update (required)')
		.option('--name <name>', 'New project name')
		.option('--favorite [value]', 'Set favorite status (true/false)', (val) =>
			val === 'false' ? false : true,
		)
		.option('--view <view>', 'New view style: list, board, calendar')
		.option('--batch <json>', 'JSON array of project updates')
		.addHelpText(
			'after',
			`
Examples:
  # Rename a project
  $ todoist projects update --id 12345 --name "Renamed Project"

  # Mark as favorite
  $ todoist projects update --id 12345 --favorite

  # Change view style
  $ todoist projects update --id 12345 --view board

  # Remove from favorites
  $ todoist projects update --id 12345 --favorite false
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const projectsArray = parseJSON(options.batch, 'batch')
					const result = await updateProjects.execute({ projects: projectsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.id) {
					throw new Error('--id is required when not using --batch')
				}

				const project: any = {
					id: options.id,
				}

				if (options.name) project.name = options.name
				if (options.favorite !== undefined) project.isFavorite = options.favorite
				if (options.view) project.viewStyle = options.view

				const result = await updateProjects.execute({ projects: [project] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// projects find
	projects
		.command('find')
		.description('Find projects by name')
		.option('--search <text>', 'Search text (case-insensitive partial match)')
		.option('--limit <limit>', 'Maximum results (default: 50)', parseInt)
		.option('--cursor <cursor>', 'Pagination cursor')
		.addHelpText(
			'after',
			`
Examples:
  # List all projects
  $ todoist projects find

  # Search for projects
  $ todoist projects find --search "work"

  # Limit results
  $ todoist projects find --limit 10
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				const params: any = {}

				if (options.search) params.search = options.search
				if (options.limit) params.limit = options.limit
				if (options.cursor) params.cursor = options.cursor

				const result = await findProjects.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
