import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  MexcSpotTicker,
  MexcFuturesResponse,
} from './types'

const QUOTE_CURRENCIES = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'EUR', 'TRY', 'BRL']

export class MexcAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'mexc',
    name: 'MEXC',
    supportedMarkets: ['spot', 'futures'],
    tvPrefix: 'MEXC',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  private spotApiUrl = 'https://api.mexc.com/api/v3/ticker/24hr'
  private futuresApiUrl = 'https://contract.mexc.com/api/v1/contract/ticker'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    const response = await fetch(this.spotApiUrl)
    if (!response.ok) {
      throw new Error(`MEXC Spot API error: ${response.status}`)
    }
    const data: MexcSpotTicker[] = await response.json()

    return data
      .filter((ticker) => this.isUsdtPair(ticker.symbol))
      .map((ticker) => {
        const baseAsset = this.extractBaseAsset(ticker.symbol)
        const quoteAsset = this.extractQuoteAsset(ticker.symbol)
        const tvSymbol = this.formatForTradingView({
          symbol: ticker.symbol,
          baseAsset,
          quoteAsset,
          volume24h: parseFloat(ticker.quoteVolume),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent) * 100,
          marketType: 'spot',
          exchange: 'mexc',
          tvSupported: true,
        })

        return {
          symbol: ticker.symbol,
          baseAsset,
          quoteAsset,
          volume24h: parseFloat(ticker.quoteVolume),
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent) * 100,
          marketType: 'spot' as const,
          exchange: 'mexc',
          tvSymbol,
          tvSupported: true,
        }
      })
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const response = await fetch(this.futuresApiUrl)
    if (!response.ok) {
      throw new Error(`MEXC Futures API error: ${response.status}`)
    }
    const data: MexcFuturesResponse = await response.json()

    if (!data.success) {
      throw new Error('MEXC Futures API returned unsuccessful response')
    }

    return data.data.map((ticker) => {
      const [baseAsset, quoteAsset] = ticker.symbol.split('_')
      const symbol = ticker.symbol.replace('_', '')
      const tvSymbol = `${this.metadata.tvPrefix}:${symbol}${this.metadata.tvFuturesSuffix}`

      return {
        symbol,
        baseAsset,
        quoteAsset,
        volume24h: ticker.amount24, // 24h notional volume in USD
        price: ticker.lastPrice,
        priceChange24h: (ticker.riseFallRates?.r7 ?? 0) * 100, // 7-day change as fallback
        marketType: 'futures' as const,
        exchange: 'mexc',
        tvSymbol,
        tvSupported: true,
      }
    })
  }

  formatForTradingView(pair: TradingPair): string {
    const suffix = pair.marketType === 'futures' ? this.metadata.tvFuturesSuffix : ''
    return `${this.metadata.tvPrefix}:${pair.symbol}${suffix}`
  }

  private isUsdtPair(symbol: string): boolean {
    return symbol.endsWith('USDT') || symbol.endsWith('USDC')
  }

  private extractBaseAsset(symbol: string): string {
    for (const quote of QUOTE_CURRENCIES) {
      if (symbol.endsWith(quote)) {
        return symbol.slice(0, -quote.length)
      }
    }
    return symbol
  }

  private extractQuoteAsset(symbol: string): string {
    for (const quote of QUOTE_CURRENCIES) {
      if (symbol.endsWith(quote)) {
        return quote
      }
    }
    return 'USDT'
  }
}
