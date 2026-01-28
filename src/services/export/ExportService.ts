import type { TradingPair } from '@/services/exchanges'

export type ExportFormat = 'txt' | 'json'

export interface ExportOptions {
  format: ExportFormat
  filename?: string
  includeMetadata?: boolean
  tvSupportedOnly?: boolean
}

/**
 * Format pairs for TradingView watchlist export
 * Returns comma-separated TV symbols
 */
export function formatForTradingView(pairs: TradingPair[]): string {
  return pairs
    .filter((pair) => pair.tvSupported && pair.tvSymbol)
    .map((pair) => pair.tvSymbol)
    .join(',')
}

/**
 * Generate export content based on format
 */
export function generateExportContent(
  pairs: TradingPair[],
  options: ExportOptions
): string {
  const pairsToExport = options.tvSupportedOnly
    ? pairs.filter((pair) => pair.tvSupported)
    : pairs

  switch (options.format) {
    case 'txt':
      return formatForTradingView(pairsToExport)

    case 'json':
      const exportData = options.includeMetadata
        ? {
            generatedAt: new Date().toISOString(),
            totalPairs: pairsToExport.length,
            tvSupportedPairs: pairsToExport.filter((p) => p.tvSupported).length,
            exchanges: [...new Set(pairsToExport.map((p) => p.exchange))],
            data: pairsToExport,
          }
        : pairsToExport
      return JSON.stringify(exportData, null, 2)

    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

/**
 * Trigger file download in browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export watchlist to file
 */
export function exportWatchlist(
  pairs: TradingPair[],
  options: ExportOptions
): void {
  const content = generateExportContent(pairs, options)

  const mimeTypes: Record<ExportFormat, string> = {
    txt: 'text/plain',
    json: 'application/json',
  }

  const timestamp = new Date().toISOString().split('T')[0]
  const defaultFilenames: Record<ExportFormat, string> = {
    txt: `tv_watchlist_${timestamp}.txt`,
    json: `watchlist_${timestamp}.json`,
  }

  const filename = options.filename || defaultFilenames[options.format]
  downloadFile(content, filename, mimeTypes[options.format])
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}
