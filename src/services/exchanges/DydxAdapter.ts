import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  DydxMarketsResponse,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class DydxAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'dydx',
    name: 'dYdX v4',
    supportedMarkets: ['futures'],
    tvPrefix: 'DYDX',
    tvFuturesSuffix: '',
    tvSupported: false, // DEX, not on TradingView
  }

  private apiUrl = 'https://indexer.dydx.trade/v4/perpetualMarkets'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    return []
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<DydxMarketsResponse>(this.apiUrl)

    return Object.values(data.markets)
      .filter((market) => market.status === 'ACTIVE')
      .map((market) => {
        // dYdX format: BTC-USD
        const baseAsset = market.ticker.split('-')[0]
        const symbol = market.ticker.replace('-', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}`

        const price = parseFloat(market.oraclePrice)
        const priceChange = parseFloat(market.priceChange24H)
        const priceChange24h = price > 0 ? (priceChange / price) * 100 : 0

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USD',
          volume24h: parseFloat(market.volume24H),
          price,
          priceChange24h,
          marketType: 'futures' as const,
          exchange: 'dydx',
          tvSymbol,
          tvSupported: false,
        }
      })
  }

  formatForTradingView(pair: TradingPair): string {
    return `${this.metadata.tvPrefix}:${pair.symbol}`
  }
}
