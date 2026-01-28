import type {
  ExchangeAdapter,
  ExchangeMetadata,
  TradingPair,
  HyperliquidMeta,
  HyperliquidAssetCtx,
} from './types'

export class HyperliquidAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    supportedMarkets: ['futures'], // Hyperliquid only has perpetuals
    tvPrefix: 'HYPERLIQUID',
    tvFuturesSuffix: '',
    tvSupported: false, // TradingView doesn't natively support Hyperliquid
  }

  private apiUrl = 'https://api.hyperliquid.xyz/info'

  async fetchSpotPairs(): Promise<TradingPair[]> {
    // Hyperliquid doesn't have spot markets
    return []
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    })

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`)
    }

    const [meta, assetCtxs]: [HyperliquidMeta, HyperliquidAssetCtx[]] = await response.json()

    return meta.universe
      .filter((coin) => !coin.isDelisted)
      .map((coin, index) => {
        const ctx = assetCtxs[index]
        const symbol = `${coin.name}USD`
        const price = parseFloat(ctx.markPx)
        const prevPrice = parseFloat(ctx.prevDayPx)
        const priceChange24h = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0

        return {
          symbol,
          baseAsset: coin.name,
          quoteAsset: 'USD',
          volume24h: parseFloat(ctx.dayNtlVlm),
          price,
          priceChange24h,
          marketType: 'futures' as const,
          exchange: 'hyperliquid',
          tvSymbol: `${this.metadata.tvPrefix}:${symbol}`,
          tvSupported: false, // TradingView doesn't support Hyperliquid
        }
      })
  }

  formatForTradingView(pair: TradingPair): string {
    // Note: TradingView doesn't support Hyperliquid natively
    // This returns a placeholder format
    return `${this.metadata.tvPrefix}:${pair.symbol}`
  }
}
