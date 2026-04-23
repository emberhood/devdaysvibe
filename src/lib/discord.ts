// TODO: Support per-module Discord channels via multiple webhook URLs in env
// TODO: Add retry logic with exponential backoff for failed webhook calls
export async function sendDiscordNotification(
  module: string,
  summary: string,
  issueCount: number,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not set')
  }

  const payload = {
    username: 'DrupalWatch',
    avatar_url: 'https://www.drupal.org/files/drupal_logo-blue.png',
    embeds: [
      {
        title: `📋 Issue Queue Update: ${module}`,
        description: summary,
        color: 0x0066cc, // Drupal blue
        fields: [
          { name: 'Module', value: module, inline: true },
          { name: 'Issues Processed', value: String(issueCount), inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'DrupalWatch' },
      },
    ],
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`)
  }
}
