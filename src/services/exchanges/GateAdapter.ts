import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  GateFuturesTicker,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class GateAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'gateio',
    name: 'Gate.io',
    supportedMarkets: ['futures'],
    tvPrefix: 'GATEIO',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  private futuresApiUrl = 'https://fx-api.gateio.ws/api/v4/futures/usdt/tickers'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    // Gate.io spot requires different API structure, skipping for now
    return []
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const data = await fetchJsonWithProxy<GateFuturesTicker[]>(this.futuresApiUrl)

    return data
      .filter((ticker) => ticker.contract.endsWith('_USDT'))
      .map((ticker) => {
        // Gate format: BTC_USDT -> BTCUSDT
        const baseAsset = ticker.contract.split('_')[0]
        const symbol = ticker.contract.replace('_', '')
        const tvSymbol = `${this.metadata.tvPrefix}:${symbol}${this.metadata.tvFuturesSuffix}`

        return {
          symbol,
          baseAsset,
          quoteAsset: 'USDT',
          volume24h: parseFloat(ticker.volume_24h_quote),
          price: parseFloat(ticker.last),
          priceChange24h: parseFloat(ticker.change_percentage),
          marketType: 'futures' as const,
          exchange: 'gateio',
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
