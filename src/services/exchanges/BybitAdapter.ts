import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  BybitTickerResponse,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class BybitAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'bybit',
    name: 'Bybit',
    supportedMarkets: ['spot', 'futures'],
    tvPrefix: 'BYBIT',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  private baseUrl = 'https://api.bybit.com/v5/market/tickers'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<BybitTickerResponse>(
      `${this.baseUrl}?category=spot`
    )

    if (data.retCode !== 0) {
      throw new Error('Bybit API error')
    }

    return data.result.list
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => {
        const baseAsset = ticker.symbol.replace('USDT', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${ticker.symbol}`

        return {
          symbol: ticker.symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.turnover24h),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.price24hPcnt) * 100,
          marketType: 'spot' as const,
          exchange: 'bybit',
          tvSymbol,
          tvSupported: true,
        }
      })
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<BybitTickerResponse>(
      `${this.baseUrl}?category=linear`
    )

    if (data.retCode !== 0) {
      throw new Error('Bybit API error')
    }

    return data.result.list
      .filter((ticker) => ticker.symbol.endsWith('USDT'))
      .map((ticker) => {
        const baseAsset = ticker.symbol.replace('USDT', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${ticker.symbol}${this.metadata.tvFuturesSuffix}`

        return {
          symbol: ticker.symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.turnover24h),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.price24hPcnt) * 100,
          marketType: 'futures' as const,
          exchange: 'bybit',
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
