import type { TDrupalIssue } from '@/types'

const DRUPAL_API_BASE = 'https://www.drupal.org/api-d7'

// TODO: Add filtering by `changed` timestamp to only fetch issues updated since last run
// TODO: Handle pagination for modules with large issue queues
// TODO: Resolve project NIDs from module machine names (Drupal API requires project NID, not slug)
export async function fetchDrupalIssues(module: string): Promise<TDrupalIssue[]> {
  // Drupal.org REST API — returns project issues sorted by most recently changed
  // Note: `field_project` expects the project node NID, not the module machine name.
  // For now we pass the module name; replace with actual NID lookup as needed.
  const url = new URL(`${DRUPAL_API_BASE}/node.json`)
  url.searchParams.set('type', 'project_issue')
  url.searchParams.set('field_project', module)
  url.searchParams.set('sort', 'changed')
  url.searchParams.set('direction', 'DESC')
  url.searchParams.set('limit', '10')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'DrupalWatch/1.0 (+https://github.com/your-org/drupalwatch)',
    },
    // Never cache — always fetch fresh issue data
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Drupal API error: ${response.status} ${response.statusText}`)
  }

  // TODO: Validate the response shape before accessing fields
  const data = await response.json()

  return (data.list ?? []).map((node: Record<string, unknown>) => ({
    nid: String(node.nid ?? ''),
    title: String(node.title ?? ''),
    field_issue_status: String(node.field_issue_status ?? '1'),
    changed: String(node.changed ?? ''),
    url: String(node.url ?? `https://www.drupal.org/node/${node.nid}`),
  }))
}
