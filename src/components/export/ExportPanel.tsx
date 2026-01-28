import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  formatForTradingView,
  exportWatchlist,
  copyToClipboard,
} from '@/services/export/ExportService'
import { Copy, Check, FileText, FileJson, AlertTriangle } from 'lucide-react'

export function ExportPanel() {
  const { getFilteredPairs } = useAppStore()
  const [copied, setCopied] = useState(false)

  const pairs = getFilteredPairs()
  const unsupportedPairs = pairs.filter((p) => !p.tvSupported)
  const tvWatchlist = formatForTradingView(pairs)

  const handleCopy = async () => {
    const success = await copyToClipboard(tvWatchlist)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportTxt = () => {
    exportWatchlist(pairs, {
      format: 'txt',
      tvSupportedOnly: false,
    })
  }

  const handleExportJson = () => {
    exportWatchlist(pairs, {
      format: 'json',
      includeMetadata: true,
      tvSupportedOnly: false,
    })
  }

  if (pairs.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          Export
          <Badge variant="secondary">{pairs.length} pairs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning for unsupported pairs */}
        {unsupportedPairs.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-600">
                {unsupportedPairs.length} pairs from DEX exchanges
              </p>
              <p className="text-muted-foreground">
                DEX pairs (Hyperliquid, dYdX, Aster, ApeX) may not work on TradingView but are included in exports.
              </p>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            TradingView Format Preview
          </label>
          <div className="relative">
            <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto max-h-32 text-foreground">
              {tvWatchlist.length > 500
                ? `${tvWatchlist.slice(0, 500)}...`
                : tvWatchlist || 'No pairs to export'}
            </pre>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            disabled={pairs.length === 0}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>

          <Button
            onClick={handleExportTxt}
            variant="outline"
            disabled={pairs.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download TXT
          </Button>

          <Button
            onClick={handleExportJson}
            variant="outline"
            disabled={pairs.length === 0}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p className="font-medium mb-1">How to import into TradingView:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click on your watchlist name in the right panel</li>
            <li>Select "Import list..." from the dropdown</li>
            <li>Choose the downloaded .txt file</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
