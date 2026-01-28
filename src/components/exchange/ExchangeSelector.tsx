import { getAllExchanges } from '@/services/exchanges'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function ExchangeSelector() {
  const {
    selectedExchanges,
    toggleExchange,
    fetchPairs,
    isLoading,
  } = useAppStore()

  const exchanges = getAllExchanges()

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Exchanges:</span>
        {exchanges.map((exchange) => {
          const isSelected = selectedExchanges.includes(exchange.metadata.id)
          return (
            <button
              key={exchange.metadata.id}
              onClick={() => toggleExchange(exchange.metadata.id)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              {exchange.metadata.name}
              {!exchange.metadata.tvSupported && (
                <Badge variant="warning" className="ml-2 text-xs">
                  No TV
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      <Button
        onClick={fetchPairs}
        disabled={isLoading || selectedExchanges.length === 0}
        className="ml-auto"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Fetching...' : 'Fetch Data'}
      </Button>
    </div>
  )
}
