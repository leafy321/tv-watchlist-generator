export type MarketType = 'spot' | 'futures'

export interface TradingPair {
  symbol: string           // Raw symbol from exchange (e.g., "BTCUSDT", "BTC_USDT")
  baseAsset: string        // e.g., "BTC"
  quoteAsset: string       // e.g., "USDT"
  volume24h: number        // 24h volume in quote currency (USD equivalent)
  price: number            // Current price
  priceChange24h: number   // 24h change percentage
  marketType: MarketType
  exchange: string         // Exchange identifier
  tvSymbol?: string        // Pre-formatted TradingView symbol
  tvSupported: boolean     // Whether TradingView supports this pair
}

export interface ExchangeMetadata {
  id: string               // e.g., "mexc", "hyperliquid"
  name: string             // Display name
  supportedMarkets: MarketType[]
  tvPrefix: string         // TradingView exchange prefix
  tvFuturesSuffix: string  // e.g., ".P" for perpetuals
  tvSupported: boolean     // Whether TradingView supports this exchange
}

export interface ExchangeAdapter {
  metadata: ExchangeMetadata
  fetchSpotPairs(): Promise<TradingPair[]>
  fetchFuturesPairs(): Promise<TradingPair[]>
  formatForTradingView(pair: TradingPair): string
}

// MEXC API Response Types
export interface MexcSpotTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
}

export interface MexcFuturesTicker {
  symbol: string           // "BTC_USDT" format
  lastPrice: number
  volume24: number         // 24h volume in base currency
  amount24: number         // 24h notional volume in USD
  bid1: number
  ask1: number
  fundingRate: number
  riseFallRates: {
    r7?: number
    r30?: number
    r90?: number
    r180?: number
    r365?: number
  }
}

export interface MexcFuturesResponse {
  success: boolean
  data: MexcFuturesTicker[]
}

// Hyperliquid API Response Types
export interface HyperliquidCoin {
  name: string
  szDecimals: number
  maxLeverage: number
  isDelisted?: boolean
}

export interface HyperliquidAssetCtx {
  dayNtlVlm: string        // 24h notional volume in USD
  markPx: string           // Mark price
  midPx: string            // Mid price
  oraclePx: string         // Oracle price
  funding: string          // Current funding rate
  openInterest: string     // Open interest
  prevDayPx: string        // Previous day price
}

export interface HyperliquidMeta {
  universe: HyperliquidCoin[]
}

// Binance API Response Types
export interface BinanceFuturesTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
}

export interface BinanceSpotTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
}

// Bybit API Response Types
export interface BybitTickerResponse {
  retCode: number
  result: {
    list: BybitTicker[]
  }
}

export interface BybitTicker {
  symbol: string
  lastPrice: string
  highPrice24h: string
  lowPrice24h: string
  prevPrice24h: string
  volume24h: string
  turnover24h: string
  price24hPcnt: string
}

// OKX API Response Types
export interface OkxTickerResponse {
  code: string
  data: OkxTicker[]
}

export interface OkxTicker {
  instId: string
  instType: string
  last: string
  open24h: string
  high24h: string
  low24h: string
  vol24h: string
  volCcy24h: string
}

// Gate.io API Response Types
export interface GateFuturesTicker {
  contract: string
  last: string
  high_24h: string
  low_24h: string
  volume_24h: string
  volume_24h_quote: string
  change_percentage: string
  mark_price: string
}

// Aster DEX API Response Types
export interface AsterTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
}

// dYdX v4 API Response Types
export interface DydxMarketsResponse {
  markets: Record<string, DydxMarket>
}

export interface DydxMarket {
  ticker: string
  status: string
  oraclePrice: string
  priceChange24H: string
  volume24H: string
  trades24H: number
}

// ApeX Omni API Response Types
export interface ApexTickerResponse {
  data: ApexTicker[]
}

export interface ApexTicker {
  symbol: string
  lastPrice: string
  high24h: string
  low24h: string
  volume24h: string
  turnover24h: string
  priceChange24h: string
}
