import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  AsterTicker,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class AsterAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'aster',
    name: 'Aster DEX',
    supportedMarkets: ['futures'],
    tvPrefix: 'ASTER',
    tvFuturesSuffix: '',
    tvSupported: false, // DEX, not on TradingView
  }

  private futuresApiUrl = 'https://fapi.asterdex.com/fapi/v3/ticker/24hr'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    return []
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<AsterTicker[]>(this.futuresApiUrl)

    return data
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => {
        const baseAsset = ticker.symbol.replace('USDT', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${ticker.symbol}`

        return {
          symbol: ticker.symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.quoteVolume),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent),
          marketType: 'futures' as const,
          exchange: 'aster',
          tvSymbol,
          tvSupported: false,
        }
      })
  }

  formatForTradingView(pair: TradingPair): string {
    return `${this.metadata.tvPrefix}:${pair.symbol}`
  }
}
