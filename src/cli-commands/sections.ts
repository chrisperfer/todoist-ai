import { Command } from 'commander'
import { addSections } from '../tools/add-sections.js'
import { updateSections } from '../tools/update-sections.js'
import { findSections } from '../tools/find-sections.js'
import { getTodoistClient, outputResult, handleError, parseJSON } from '../cli-helpers.js'

export function registerSectionsCommands(program: Command) {
	const sections = program
		.command('sections')
		.description('Manage sections within projects')
		.addHelpText(
			'after',
			`
Available Commands:
  add         Add one or more sections
  update      Update existing sections
  find        Find sections in a project

Examples:
  $ todoist sections add --name "To Do" --project-id 12345
  $ todoist sections find --project-id 12345
  $ todoist sections update --id 67890 --name "In Progress"
`,
		)

	// sections add
	sections
		.command('add')
		.description('Add one or more sections to a project')
		.option('--name <name>', 'Section name (required)')
		.option('--project-id <projectId>', 'Project ID (required)')
		.option('--batch <json>', 'JSON array of sections to create')
		.addHelpText(
			'after',
			`
Examples:
  # Add a section
  $ todoist sections add --name "To Do" --project-id 12345

  # Batch add sections
  $ todoist sections add --batch '[{"name":"To Do","projectId":"123"},{"name":"Done","projectId":"123"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const sectionsArray = parseJSON(options.batch, 'batch')
					const result = await addSections.execute({ sections: sectionsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.name) {
					throw new Error('--name is required when not using --batch')
				}
				if (!options.projectId) {
					throw new Error('--project-id is required when not using --batch')
				}

				const section: any = {
					name: options.name,
					projectId: options.projectId,
				}

				const result = await addSections.execute({ sections: [section] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// sections update
	sections
		.command('update')
		.description('Update existing sections')
		.option('--id <id>', 'Section ID to update (required)')
		.option('--name <name>', 'New section name (required)')
		.option('--batch <json>', 'JSON array of section updates')
		.addHelpText(
			'after',
			`
Examples:
  # Rename a section
  $ todoist sections update --id 67890 --name "In Progress"

  # Batch update
  $ todoist sections update --batch '[{"id":"123","name":"New Name"}]'
`,
		)
		.action(async (options, command) => {
			try {
				const client = getTodoistClient(command)

				if (options.batch) {
					const sectionsArray = parseJSON(options.batch, 'batch')
					const result = await updateSections.execute({ sections: sectionsArray }, client)
					outputResult(command, result)
					return
				}

				if (!options.id) {
					throw new Error('--id is required when not using --batch')
				}
				if (!options.name) {
					throw new Error('--name is required when not using --batch')
				}

				const section: any = {
					id: options.id,
					name: options.name,
				}

				const result = await updateSections.execute({ sections: [section] }, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})

	// sections find
	sections
		.command('find')
		.description('Find sections in a project')
		.option('--project-id <projectId>', 'Project ID (required)')
		.option('--search <text>', 'Search text (case-insensitive partial match)')
		.addHelpText(
			'after',
			`
Examples:
  # List all sections in a project
  $ todoist sections find --project-id 12345

  # Search for sections
  $ todoist sections find --project-id 12345 --search "progress"
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

				if (options.search) params.search = options.search

				const result = await findSections.execute(params, client)
				outputResult(command, result)
			} catch (error) {
				handleError(error)
			}
		})
}
