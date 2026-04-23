export type TIssueStatus =
  | 'active'
  | 'needs_work'
  | 'needs_review'
  | 'rtbc'
  | 'fixed'
  | 'closed'

export type TIssueUpdate = {
  id: string
  title: string
  summary?: string | null
  url: string
  module: string
  status?: TIssueStatus | null
  notifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type TDrupalIssue = {
  nid: string
  title: string
  field_issue_status: string
  changed: string
  url: string
}

export type TFetchIssuesRequest = {
  module: string
}

export type TFetchIssuesResponse = {
  success: boolean
  message: string
  count?: number
  error?: string
}
