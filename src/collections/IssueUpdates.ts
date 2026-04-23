import type { CollectionConfig } from 'payload'

export const IssueUpdates: CollectionConfig = {
  slug: 'issue-updates',
  admin: {
    useAsTitle: 'title',
    description: 'Tracked Drupal.org issue queue updates',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Issue Title',
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'AI Summary',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Issue URL',
    },
    {
      name: 'module',
      type: 'text',
      required: true,
      label: 'Drupal Module',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Issue Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Needs Work', value: 'needs_work' },
        { label: 'Needs Review', value: 'needs_review' },
        { label: 'RTBC', value: 'rtbc' },
        { label: 'Fixed', value: 'fixed' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'notifiedAt',
      type: 'date',
      label: 'Notified At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
