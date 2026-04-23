import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchDrupalIssues } from '@/lib/drupal'
import { summarizeIssues } from '@/lib/anthropic'
import { sendDiscordNotification } from '@/lib/discord'
import type { TFetchIssuesRequest, TFetchIssuesResponse, TDrupalIssue } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<TFetchIssuesResponse>> {
  try {
    const body: TFetchIssuesRequest = await request.json()
    const { module } = body

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module name is required', error: 'Missing module parameter' },
        { status: 400 },
      )
    }

    // Step 1: Fetch issues from Drupal.org
    const issues: TDrupalIssue[] = await fetchDrupalIssues(module)

    if (issues.length === 0) {
      return NextResponse.json({ success: true, message: 'No issues found', count: 0 })
    }

    // Step 2: Summarize using Claude
    const summary = await summarizeIssues(module, issues)

    // Step 3: Send to Discord
    await sendDiscordNotification(module, summary, issues.length)

    // Step 4: Save each issue to Payload
    const payload = await getPayload({ config })
    let savedCount = 0

    for (const issue of issues) {
      // TODO: Check for duplicate URLs to avoid re-saving existing issues
      await payload.create({
        collection: 'issue-updates',
        data: {
          title: issue.title,
          summary,
          url: issue.url,
          module,
          status: mapDrupalStatus(issue.field_issue_status),
          notifiedAt: new Date().toISOString(),
        },
      })
      savedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Fetched and saved ${savedCount} issues for "${module}"`,
      count: savedCount,
    })
  } catch (err) {
    console.error('[fetch-issues] Error:', err)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// TODO: Map Drupal issue status codes to our status values
// Drupal status codes: 1=active, 2=fixed, 3=closed, 8=needs review, 13=needs work, 14=RTBC
function mapDrupalStatus(drupalStatus: string): string {
  const statusMap: Record<string, string> = {
    '1': 'active',
    '2': 'fixed',
    '3': 'closed',
    '8': 'needs_review',
    '13': 'needs_work',
    '14': 'rtbc',
  }
  return statusMap[drupalStatus] ?? 'active'
}
