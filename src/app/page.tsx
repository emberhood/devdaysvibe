import { getPayload } from 'payload'
import config from '@payload-config'
import { Dashboard } from '@/components/dashboard'
import type { TIssueUpdate } from '@/types'

async function getInitialIssues(): Promise<TIssueUpdate[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'issue-updates',
      limit: 20,
      sort: '-createdAt',
    })
    return result.docs as unknown as TIssueUpdate[]
  } catch {
    return []
  }
}

export default async function Home() {
  const initialIssues = await getInitialIssues()

  return (
    <main className="min-h-screen bg-slate-950">
      <Dashboard initialIssues={initialIssues} />
    </main>
  )
}
