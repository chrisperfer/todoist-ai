import { addDays, formatISO } from 'date-fns'
import { z } from 'zod'
import {
    appendToQuery,
    buildResponsibleUserQueryFilter,
    RESPONSIBLE_USER_FILTERING,
    resolveResponsibleUser,
} from '../filter-helpers.js'
import { getToolOutput } from '../mcp-helpers.js'
import type { TodoistTool } from '../todoist-tool.js'
import { getTasksByFilter } from '../tool-helpers.js'
import { ApiLimits } from '../utils/constants.js'
import { generateLabelsFilter, LabelsSchema } from '../utils/labels.js'
import {
    generateTaskNextSteps,
    getDateString,
    previewTasks,
    summarizeList,
} from '../utils/response-builders.js'
import { ToolNames } from '../utils/tool-names.js'

const ArgsSchema = {
    startDate: z
        .string()
        .regex(/^(\d{4}-\d{2}-\d{2}|today)$/)
        .optional()
        .describe("The start date to get the tasks for. Format: YYYY-MM-DD or 'today'."),
    overdueOption: z
        .enum(['overdue-only', 'include-overdue', 'exclude-overdue'])
        .optional()
        .describe(
            "How to handle overdue tasks. 'overdue-only' to get only overdue tasks, 'include-overdue' to include overdue tasks along with tasks for the specified date(s), and 'exclude-overdue' to exclude overdue tasks. Default is 'include-overdue'.",
        ),
    daysCount: z
        .number()
        .int()
        .min(1)
        .max(30)
        .default(1)
        .describe(
            'The number of days to get the tasks for, starting from the start date. Default is 1 which means only tasks for the start date.',
        ),
    limit: z
        .number()
        .int()
        .min(1)
        .max(ApiLimits.TASKS_MAX)
        .default(ApiLimits.TASKS_DEFAULT)
        .describe('The maximum number of tasks to return.'),
    cursor: z
        .string()
        .optional()
        .describe(
            'The cursor to get the next page of tasks (cursor is obtained from the previous call to this tool, with the same parameters).',
        ),
    responsibleUser: z
        .string()
        .optional()
        .describe('Find tasks assigned to this user. Can be a user ID, name, or email address.'),
    responsibleUserFiltering: z
        .enum(RESPONSIBLE_USER_FILTERING)
        .optional()
        .describe(
            'How to filter by responsible user when responsibleUser is not provided. "assigned" = only tasks assigned to others; "unassignedOrMe" = only unassigned tasks or tasks assigned to me; "all" = all tasks regardless of assignment. Default is "unassignedOrMe".',
        ),
    ...LabelsSchema,
}

const findTasksByDate = {
    name: ToolNames.FIND_TASKS_BY_DATE,
    description:
        "Get tasks by date range. Use startDate 'today' to get today's tasks including overdue items, or provide a specific date/date range.",
    parameters: ArgsSchema,
    async execute(args, client) {
        if (!args.startDate && args.overdueOption !== 'overdue-only') {
            throw new Error(
                'Either startDate must be provided or overdueOption must be set to overdue-only',
            )
        }

        // Resolve assignee name to user ID if provided
        const resolved = await resolveResponsibleUser(client, args.responsibleUser)
        const resolvedAssigneeId = resolved?.userId
        const assigneeEmail = resolved?.email

        let query = ''

        if (args.overdueOption === 'overdue-only') {
            query = 'overdue'
        } else if (args.startDate === 'today') {
            // For 'today', include overdue unless explicitly excluded
            // Use parentheses to ensure correct operator precedence when combining with other filters
            query = args.overdueOption === 'exclude-overdue' ? 'today' : '(today | overdue)'
        } else if (args.startDate) {
            // For specific dates, never include overdue tasks
            const startDate = args.startDate
            const endDate = addDays(startDate, args.daysCount)
            const endDateStr = formatISO(endDate, { representation: 'date' })
            query = `(due after: ${startDate} | due: ${startDate}) & due before: ${endDateStr}`
        }

        // Add labels filter
        const labelsFilter = generateLabelsFilter(args.labels, args.labelsOperator)
        if (labelsFilter.length > 0) {
            query = appendToQuery(query, `(${labelsFilter})`)
        }

        // Add responsible user filtering to the query (backend filtering)
        const responsibleUserFilter = buildResponsibleUserQueryFilter({
            resolvedAssigneeId,
            assigneeEmail,
            responsibleUserFiltering: args.responsibleUserFiltering,
        })
        query = appendToQuery(query, responsibleUserFilter)

        const result = await getTasksByFilter({
            client,
            query,
            cursor: args.cursor,
            limit: args.limit,
        })

        // No need for post-fetch filtering since it's handled in the query
        const filteredTasks = result.tasks

        const textContent = generateTextContent({
            tasks: filteredTasks,
            args,
            nextCursor: result.nextCursor,
            assigneeEmail,
        })

        return getToolOutput({
            textContent,
            structuredContent: {
                tasks: filteredTasks,
                nextCursor: result.nextCursor,
                totalCount: filteredTasks.length,
                hasMore: Boolean(result.nextCursor),
                appliedFilters: args,
            },
        })
    },
} satisfies TodoistTool<typeof ArgsSchema>

function generateTextContent({
    tasks,
    args,
    nextCursor,
    assigneeEmail,
}: {
    tasks: Awaited<ReturnType<typeof getTasksByFilter>>['tasks']
    args: z.infer<z.ZodObject<typeof ArgsSchema>>
    nextCursor: string | null
    assigneeEmail?: string
}) {
    // Generate filter description
    const filterHints: string[] = []

    if (args.overdueOption === 'overdue-only') {
        filterHints.push('overdue tasks only')
    } else if (args.startDate === 'today') {
        const overdueText = args.overdueOption === 'exclude-overdue' ? '' : ' + overdue tasks'
        filterHints.push(
            `today${overdueText}${args.daysCount > 1 ? ` + ${args.daysCount - 1} more days` : ''}`,
        )
    } else if (args.startDate) {
        const dateRange =
            args.daysCount > 1
                ? ` to ${getDateString(addDays(args.startDate, args.daysCount))}`
                : ''
        filterHints.push(`${args.startDate}${dateRange}`)
    }

    // Add label filter information
    if (args.labels && args.labels.length > 0) {
        const labelText = args.labels
            .map((label) => `@${label}`)
            .join(args.labelsOperator === 'and' ? ' & ' : ' | ')
        filterHints.push(`labels: ${labelText}`)
    }

    // Add responsible user filter information
    if (args.responsibleUser) {
        const email = assigneeEmail || args.responsibleUser
        filterHints.push(`assigned to: ${email}`)
    }

    // Generate subject description
    let subject = ''
    if (args.overdueOption === 'overdue-only') {
        subject = 'Overdue tasks'
    } else if (args.startDate === 'today') {
        subject =
            args.overdueOption === 'exclude-overdue' ? `Today's tasks` : `Today's tasks + overdue`
    } else if (args.startDate) {
        subject = `Tasks for ${args.startDate}`
    } else {
        subject = 'Tasks'
    }

    // Append responsible user to subject if provided
    if (args.responsibleUser) {
        const email = assigneeEmail || args.responsibleUser
        subject += ` assigned to ${email}`
    }

    // Generate helpful suggestions for empty results
    const zeroReasonHints: string[] = []
    if (tasks.length === 0) {
        if (args.overdueOption === 'overdue-only') {
            zeroReasonHints.push('Great job! No overdue tasks')
        } else if (args.startDate === 'today') {
            const overdueNote = args.overdueOption === 'exclude-overdue' ? '' : ' or overdue'
            zeroReasonHints.push(`Great job! No tasks for today${overdueNote}`)
        } else {
            zeroReasonHints.push("Expand date range with larger 'daysCount'")
            zeroReasonHints.push("Check today's tasks with startDate='today'")
        }
    }

    // Generate contextual next steps
    const now = new Date()
    const todayStr = getDateString(now)
    const hasOverdue =
        args.overdueOption === 'overdue-only' ||
        args.startDate === 'today' ||
        tasks.some((task) => task.dueDate && new Date(task.dueDate) < now)
    const nextSteps = generateTaskNextSteps('listed', tasks, {
        hasToday: args.startDate === 'today' || tasks.some((task) => task.dueDate === todayStr),
        hasOverdue,
    })

    return summarizeList({
        subject,
        count: tasks.length,
        limit: args.limit,
        nextCursor: nextCursor ?? undefined,
        filterHints,
        previewLines: previewTasks(tasks), // Uses default limit of 5 for preview
        zeroReasonHints,
        nextSteps,
    })
}

export { findTasksByDate }
