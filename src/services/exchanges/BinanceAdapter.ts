import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  BinanceFuturesTicker,
  BinanceSpotTicker,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class BinanceAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'binance',
    name: 'Binance',
    supportedMarkets: ['spot', 'futures'],
    tvPrefix: 'BINANCE',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  private spotApiUrl = 'https://api.binance.com/api/v3/ticker/24hr'
  private futuresApiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<BinanceSpotTicker[]>(this.spotApiUrl)

    return data
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => {
        const baseAsset = ticker.symbol.replace('USDT', '')
        const symbol = ticker.symbol
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}`

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.quoteVolume),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent),
          marketType: 'spot' as const,
          exchange: 'binance',
          tvSymbol,
          tvSupported: true,
        }
      })
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<BinanceFuturesTicker[]>(this.futuresApiUrl)

    return data
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => {
        const baseAsset = ticker.symbol.replace('USDT', '')
        const symbol = ticker.symbol
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}${this.metadata.tvFuturesSuffix}`

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.quoteVolume),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent),
          marketType: 'futures' as const,
          exchange: 'binance',
          tvSymbol,
          tvSupported: true,
        }
      })
  }

  formatForTradingView(pair: TradingPair): string {
    const suffix = pair.marketType === 'futures' ? this.metadata.tvFuturesSuffix : ''
    return `${this.metadata.tvPrefix}:${pair.symbol}${suffix}`
  }
}
