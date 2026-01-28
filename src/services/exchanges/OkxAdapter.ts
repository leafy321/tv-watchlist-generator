import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  OkxTickerResponse,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class OkxAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'okx',
    name: 'OKX',
    supportedMarkets: ['spot', 'futures'],
    tvPrefix: 'OKX',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  private baseUrl = 'https://www.okx.com/api/v5/market/tickers'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<OkxTickerResponse>(
      `${this.baseUrl}?instType=SPOT`
    )

    if (data.code !== '0') {
      throw new Error('OKX API error')
    }

    return data.data
      .filter((ticker) => ticker.instId.endsWith('-USDT'))
      .map((ticker) => {
        // OKX format: BTC-USDT -> BTCUSDT
        const baseAsset = ticker.instId.split('-')[0]
        const symbol = ticker.instId.replace('-', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}`

        const open = parseFloat(ticker.open24h)
        const last = parseFloat(ticker.last)
        const priceChange24h = open > 0 ? ((last - open) / open) * 100 : 0

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.volCcy24h),
          price: last,
          priceChange24h,
          marketType: 'spot' as const,
          exchange: 'okx',
          tvSymbol,
          tvSupported: true,
        }
      })
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<OkxTickerResponse>(
      `${this.baseUrl}?instType=SWAP`
    )

    if (data.code !== '0') {
      throw new Error('OKX API error')
    }

    return data.data
      .filter((ticker) => ticker.instId.endsWith('-USDT-SWAP'))
      .map((ticker) => {
        // OKX format: BTC-USDT-SWAP -> BTCUSDT
        const baseAsset = ticker.instId.split('-')[0]
        const symbol = `${baseAsset}USDT`
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}${this.metadata.tvFuturesSuffix}`

        const open = parseFloat(ticker.open24h)
        const last = parseFloat(ticker.last)
        const priceChange24h = open > 0 ? ((last - open) / open) * 100 : 0

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.volCcy24h),
          price: last,
          priceChange24h,
          marketType: 'futures' as const,
          exchange: 'okx',
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
