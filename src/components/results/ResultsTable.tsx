import { useAppStore, type SortField } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { formatVolume, formatPrice, formatPercent } from '@/utils/volume'
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'

export function ResultsTable() {
  const {
    getFilteredPairs,
    filters,
    setSortBy,
    setSortDirection,
    isLoading,
    error,
  } = useAppStore()

  const pairs = getFilteredPairs()

  const handleSort = (field: SortField) => {
    if (filters.sortBy === field) {
      setSortDirection(filters.sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return filters.sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pairs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  if (pairs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          No pairs found. Click "Fetch Data" to load pairs from selected exchanges.
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center text-sm font-medium text-foreground hover:text-primary"
                >
                  Symbol
                  <SortIcon field="symbol" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                Exchange
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('volume')}
                  className="flex items-center justify-end w-full text-sm font-medium text-foreground hover:text-primary"
                >
                  Volume 24h
                  <SortIcon field="volume" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center justify-end w-full text-sm font-medium text-foreground hover:text-primary"
                >
                  Price
                  <SortIcon field="price" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('change')}
                  className="flex items-center justify-end w-full text-sm font-medium text-foreground hover:text-primary"
                >
                  Change
                  <SortIcon field="change" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                TV Symbol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pairs.map((pair, index) => (
              <tr
                key={`${pair.exchange}-${pair.symbol}-${pair.marketType}-${index}`}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{pair.symbol}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground capitalize">
                    {pair.exchange}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={pair.marketType === 'futures' ? 'default' : 'secondary'}>
                    {pair.marketType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-foreground">
                    ${formatVolume(pair.volume24h)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-foreground">
                    ${formatPrice(pair.price)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-sm ${
                      pair.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercent(pair.priceChange24h)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {pair.tvSymbol}
                    </code>
                    {!pair.tvSupported && (
                      <span title="Not supported on TradingView">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
