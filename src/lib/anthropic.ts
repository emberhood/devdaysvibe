import Anthropic from '@anthropic-ai/sdk'
import type { TDrupalIssue } from '@/types'

// TODO: Make model and token limits configurable via env vars
// TODO: Consider different prompt strategies per module type (security, performance, UX, etc.)
export async function summarizeIssues(module: string, issues: TDrupalIssue[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const client = new Anthropic({ apiKey })

  const issueList = issues
    .map((issue, i) => `${i + 1}. ${issue.title} (${issue.url}) — Status: ${issue.field_issue_status}`)
    .join('\n')

  const prompt = `You are a Drupal developer assistant. Summarize the following Drupal.org issue queue updates for the "${module}" module in 3-5 sentences. Focus on what's being actively worked on, any critical bugs, and significant changes.

Issues:
${issueList}

Provide a concise, developer-friendly summary:`

  // TODO: Tune model and max_tokens based on queue size
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API')
  }

  return content.text
}
