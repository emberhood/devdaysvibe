'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TIssueUpdate, TFetchIssuesResponse } from '@/types'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const DEFAULT_MODULE = 'drupal'

type DashboardProps = {
  initialIssues: TIssueUpdate[]
}

export function Dashboard({ initialIssues }: DashboardProps) {
  const [issues, setIssues] = useState<TIssueUpdate[]>(initialIssues)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [moduleInput, setModuleInput] = useState(DEFAULT_MODULE)

  const loadIssues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/issue-updates?limit=20&sort=-createdAt')
      if (!res.ok) throw new Error('Failed to load issues')
      const data = await res.json()
      setIssues(data.docs ?? [])
      setLastFetched(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerFetch = async () => {
    setFetching(true)
    setError(null)
    try {
      const res = await fetch('/api/fetch-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: moduleInput }),
      })
      const data: TFetchIssuesResponse = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Fetch failed')
      }
      await loadIssues()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    // Set initial timestamp if we got server-side data
    if (initialIssues.length > 0) {
      setLastFetched(new Date())
    } else {
      loadIssues()
    }

    // Auto-poll every 5 minutes
    const interval = setInterval(loadIssues, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadIssues, initialIssues.length])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">DrupalWatch</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor Drupal.org issue queues</p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-slate-500 hidden sm:block">
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <input
            type="text"
            value={moduleInput}
            onChange={(e) => setModuleInput(e.target.value)}
            placeholder="Module name"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
          />
          <button
            onClick={triggerFetch}
            disabled={fetching || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-700 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap"
          >
            {fetching ? 'Fetching…' : 'Fetch Issues'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-950 border border-red-800 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stats bar */}
      <div className="mb-4 flex items-center gap-3">
        <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
          {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-slate-600">Auto-refreshing every 5 minutes</span>
        {loading && (
          <span className="text-xs text-emerald-400 animate-pulse">Loading…</span>
        )}
      </div>

      {/* Content */}
      {issues.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <IssueTable issues={issues} />
      )}
    </div>
  )
}

function IssueTable({ issues }: { issues: TIssueUpdate[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900">
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Title
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Module
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Summary
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Notified
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {issues.map((issue) => (
            <tr key={issue.id} className="bg-slate-950 hover:bg-slate-900 transition-colors">
              <td className="px-4 py-3 max-w-xs">
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium truncate block"
                >
                  {issue.title}
                </a>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                  {issue.module}
                </span>
              </td>
              <td className="px-4 py-3">
                {issue.status ? (
                  <StatusBadge status={issue.status} />
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 max-w-sm">
                <p className="text-slate-400 text-xs truncate">
                  {issue.summary ?? <span className="text-slate-600 italic">No summary yet</span>}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                {issue.notifiedAt ? (
                  new Date(issue.notifiedAt).toLocaleDateString()
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-blue-950 text-blue-300 border-blue-800',
  needs_work: 'bg-yellow-950 text-yellow-300 border-yellow-800',
  needs_review: 'bg-purple-950 text-purple-300 border-purple-800',
  rtbc: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  fixed: 'bg-slate-800 text-slate-400 border-slate-700',
  closed: 'bg-slate-900 text-slate-600 border-slate-800',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  needs_work: 'Needs Work',
  needs_review: 'Needs Review',
  rtbc: 'RTBC',
  fixed: 'Fixed',
  closed: 'Closed',
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-800 text-slate-400 border-slate-700'
  const label = STATUS_LABELS[status] ?? status

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${style}`}>{label}</span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-lg border border-slate-800 bg-slate-900">
      <div className="text-4xl mb-4">🔍</div>
      <p className="text-slate-400 font-medium">No issues tracked yet</p>
      <p className="text-slate-600 text-sm mt-2">
        Enter a module name and click &quot;Fetch Issues&quot; to get started
      </p>
    </div>
  )
}
