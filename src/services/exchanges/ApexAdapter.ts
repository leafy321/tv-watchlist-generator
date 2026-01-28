import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
} from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

// ApeX Omni specific response types
interface ApexOmniTickerResponse {
  data: {
    perpetualContract: ApexOmniTicker[]
  }
}

interface ApexOmniTicker {
  symbol: string
  lastPrice: string
  price24hPcnt: string
  highPrice24h: string
  lowPrice24h: string
  turnover24h: string
  volume24h: string
}

export class ApexAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'apex',
    name: 'ApeX Omni',
    supportedMarkets: ['futures'],
    tvPrefix: 'APEX',
    tvFuturesSuffix: '',
    tvSupported: false, // DEX, not on TradingView
  }

  // Using ApeX Pro API as fallback since Omni endpoints are inconsistent
  private tickerUrl = 'https://pro.apex.exchange/api/v1/ticker'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    return []
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    try {
      // Try fetching from the ticker endpoint
      const data = await fetchJsonWithProxy<ApexOmniTickerResponse>(this.tickerUrl)

      if (!data.data?.perpetualContract) {
        return []
      }

      return data.data.perpetualContract
        .filter((ticker) => ticker.symbol.endsWith('USDC'))
        .map((ticker) => {
          // ApeX format: BTC-USDC -> BTCUSDC
          const baseAsset = ticker.symbol.split('-')[0]
          const symbol = ticker.symbol.replace('-', '')
          const tvSymbol = `${this.metadata.tvPrefix}:${symbol}`

          return {
            symbol,
            baseAsset,
            quoteAsset: 'USDC',
            volume24h: parseFloat(ticker.turnover24h || '0'),
            price: parseFloat(ticker.lastPrice || '0'),
            priceChange24h: parseFloat(ticker.price24hPcnt || '0') * 100,
            marketType: 'futures' as const,
            exchange: 'apex',
            tvSymbol,
            tvSupported: false,
          }
        })
    } catch (error) {
      console.error('ApeX API error:', error)
      return []
    }
  }

  formatForTradingView(pair: TradingPair): string {
    return `${this.metadata.tvPrefix}:${pair.symbol}`
  }
}
