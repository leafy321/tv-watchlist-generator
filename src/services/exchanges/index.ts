import type { ExchangeAdapter, TradingPair, MarketType } from './types'
import { MexcAdapter } from './MexcAdapter'
import { HyperliquidAdapter } from './HyperliquidAdapter'

// Registry of all available exchanges
const exchangeRegistry = new Map<string, ExchangeAdapter>()

// Register built-in exchanges
exchangeRegistry.set('mexc', new MexcAdapter())
exchangeRegistry.set('hyperliquid', new HyperliquidAdapter())

export function getExchange(id: string): ExchangeAdapter | undefined {
  return exchangeRegistry.get(id)
}

export function getAllExchanges(): ExchangeAdapter[] {
  return Array.from(exchangeRegistry.values())
}

export function getExchangeIds(): string[] {
  return Array.from(exchangeRegistry.keys())
}

export function registerExchange(adapter: ExchangeAdapter): void {
  exchangeRegistry.set(adapter.metadata.id, adapter)
}

// Fetch pairs from multiple exchanges
export async function fetchPairsFromExchanges(
  exchangeIds: string[],
  marketTypes: MarketType[]
): Promise<TradingPair[]> {
  const allPairs: TradingPair[] = []

  const fetchPromises = exchangeIds.flatMap((exchangeId) => {
    const exchange = getExchange(exchangeId)
    if (!exchange) return []

    const promises: Promise<TradingPair[]>[] = []

    if (marketTypes.includes('spot') && exchange.metadata.supportedMarkets.includes('spot')) {
      promises.push(
        exchange.fetchSpotPairs().catch((error) => {
          console.error(`Error fetching ${exchangeId} spot pairs:`, error)
          return []
        })
      )
    }

    if (marketTypes.includes('futures') && exchange.metadata.supportedMarkets.includes('futures')) {
      promises.push(
        exchange.fetchFuturesPairs().catch((error) => {
          console.error(`Error fetching ${exchangeId} futures pairs:`, error)
          return []
        })
      )
    }

    return promises
  })

  const results = await Promise.all(fetchPromises)
  results.forEach((pairs) => allPairs.push(...pairs))

  return allPairs
}

// Re-export types
export type { ExchangeAdapter, TradingPair, MarketType, ExchangeMetadata } from './types'
