import type { Command } from 'commander'
import type { TodoistApi } from '@doist/todoist-api-typescript'

/**
 * Get the Todoist API client from the command context
 */
export function getTodoistClient(command: Command): TodoistApi {
	return (command as any).todoistClient
}

/**
 * Check if JSON output is enabled
 */
export function isJsonOutput(command: Command): boolean {
	// Check if --json was passed at any level
	let current: Command | null = command
	while (current) {
		const opts = current.opts()
		if (opts.json) {
			return true
		}
		current = current.parent
	}
	return false
}

/**
 * Output result in the appropriate format (text or JSON)
 */
export function outputResult(command: Command, result: any) {
	if (isJsonOutput(command)) {
		// JSON output: use structuredContent if available, otherwise the whole result
		const output = result.content?.[1]?.text ? JSON.parse(result.content[1].text) : result
		console.log(JSON.stringify(output, null, 2))
	} else {
		// Text output: use textContent if available
		const textContent = result.content?.[0]?.text || JSON.stringify(result, null, 2)
		console.log(textContent)
	}
}

/**
 * Handle errors and exit with appropriate message
 */
export function handleError(error: unknown) {
	if (error instanceof Error) {
		console.error(`Error: ${error.message}`)
	} else {
		console.error('An unexpected error occurred:', error)
	}
	process.exit(1)
}

/**
 * Parse comma-separated values into array
 */
export function parseArray(value: string): string[] {
	return value.split(',').map((v) => v.trim())
}

/**
 * Parse JSON string safely
 */
export function parseJSON<T = any>(value: string, fieldName: string): T {
	try {
		return JSON.parse(value) as T
	} catch (error) {
		throw new Error(`Invalid JSON for ${fieldName}: ${error}`)
	}
}
