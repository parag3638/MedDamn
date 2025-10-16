// lib/templates/helpers.ts
import type { TemplateItem } from '@/lib/types'

export function formatUpdatedAgo(iso: string): string {
  const ts = Date.parse(iso)
  const diff = Date.now() - ts
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 60) return `Updated ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Updated ${hours}h ago`
  const days = Math.floor(hours / 24)
  return `Updated ${days}d ago`
}

export function typeLabel(type: TemplateItem['type']): string {
  switch (type) {
    case 'soap': return 'SOAP'
    case 'snippet': return 'Snippet'
    case 'prompt': return 'Prompt'
    case 'checklist': return 'Checklist'
    default: return type
  }
}

export function previewLine(item: TemplateItem): string {
  const content = item.content
  if ('soap' in content) return `S: ${content.soap.S}`
  if ('snippet' in content) return content.snippet.text.slice(0, 100)
  if ('prompt' in content) return content.prompt.user.split('\n')[0]
  if ('checklist' in content) {
    return content.checklist.items.slice(0, 2).map(i => `• ${i.text}`).join(', ')
  }
  return ''
}
