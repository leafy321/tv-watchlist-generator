# TradingView Watchlist Generator

A web application to fetch trading pairs from multiple cryptocurrency exchanges, apply filters, and export them in TradingView-compatible format for bulk watchlist import.

## Features

- **Multi-Exchange Support**: Fetch data from 9 exchanges simultaneously
- **Flexible Filtering**: Filter by volume, market type (spot/futures), and search by symbol
- **TradingView Export**: Generate comma-separated watchlist files ready for TradingView import
- **Multiple Export Formats**: Export as TXT (TradingView), JSON (with metadata), or copy to clipboard
- **Real-time Data**: Fetches live 24h volume, price, and price change data
- **Sortable Results**: Sort by symbol, volume, price, or 24h change

## Supported Exchanges

| Exchange | Spot | Futures | TradingView Support |
|----------|:----:|:-------:|:-------------------:|
| Binance | Yes | Yes | Yes |
| Bybit | Yes | Yes | Yes |
| OKX | Yes | Yes | Yes |
| MEXC | Yes | Yes | Yes |
| Gate.io | - | Yes | Yes |
| Hyperliquid | - | Yes | No (DEX) |
| dYdX v4 | - | Yes | No (DEX) |
| Aster DEX | - | Yes | No (DEX) |
| ApeX Omni | - | Yes | No (DEX) |

> **Note**: DEX exchanges (Hyperliquid, dYdX, Aster, ApeX) are not supported on TradingView. Their data is available for reference and JSON export only.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

### Clone the Repository

```bash
git clone https://github.com/leafy321/tv-watchlist-generator.git
cd tv-watchlist-generator
```

### Install Dependencies

```bash
npm install
```

## Usage

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## How to Use

1. **Select Exchanges**: Click on exchange buttons to toggle them on/off
2. **Fetch Data**: Click "Fetch Data" to retrieve pairs from selected exchanges
3. **Apply Filters**:
   - Set minimum volume (e.g., `500K`, `1M`, `10M`)
   - Toggle market types (Futures/Spot)
   - Search for specific symbols
4. **Sort Results**: Click column headers to sort by symbol, volume, price, or change
5. **Export**:
   - **Copy to Clipboard**: Copies TradingView-formatted list
   - **Download TXT**: Downloads `.txt` file for TradingView import
   - **Download JSON**: Downloads full data with metadata

## Importing into TradingView

1. In TradingView, click on your watchlist name in the right panel
2. Select "Import list..." from the dropdown menu
3. Choose the downloaded `.txt` file
4. Your pairs will be added to the watchlist

## TradingView Symbol Format

The application formats symbols according to TradingView conventions:

| Exchange | Spot | Futures |
|----------|------|---------|
| Binance | `BINANCE:BTCUSDT` | `BINANCE:BTCUSDT.P` |
| Bybit | `BYBIT:BTCUSDT` | `BYBIT:BTCUSDT.P` |
| OKX | `OKX:BTCUSDT` | `OKX:BTCUSDT.P` |
| MEXC | `MEXC:BTCUSDT` | `MEXC:BTCUSDT.P` |
| Gate.io | `GATEIO:BTCUSDT` | `GATEIO:BTCUSDT.P` |

## Project Structure

```
tv-watchlist-generator/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Input, Card, etc.)
│   │   ├── layout/          # Layout components (Header)
│   │   ├── exchange/        # Exchange selector component
│   │   ├── filters/         # Filter panel component
│   │   ├── results/         # Results table component
│   │   └── export/          # Export panel component
│   ├── services/
│   │   ├── exchanges/       # Exchange adapters (one per exchange)
│   │   └── export/          # Export service
│   ├── store/               # Zustand state management
│   ├── utils/               # Utility functions (volume formatting, CORS proxy)
│   ├── lib/                 # Shared utilities
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── index.html               # Entry HTML
├── package.json
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React

## Adding New Exchanges

The application uses an adapter pattern for easy extensibility. To add a new exchange:

1. Create a new adapter in `src/services/exchanges/`:

```typescript
// src/services/exchanges/NewExchangeAdapter.ts
import type { ExchangeAdapter, ExchangeMetadata, TradingPair } from './types'
import { fetchJsonWithProxy } from '@/utils/fetch'

export class NewExchangeAdapter implements ExchangeAdapter {
  metadata: ExchangeMetadata = {
    id: 'newexchange',
    name: 'New Exchange',
    supportedMarkets: ['spot', 'futures'],
    tvPrefix: 'NEWEXCHANGE',
    tvFuturesSuffix: '.P',
    tvSupported: true,
  }

  async fetchSpotPairs(): Promise<TradingPair[]> {
    // Implementation
  }

  async fetchFuturesPairs(): Promise<TradingPair[]> {
    // Implementation
  }

  formatForTradingView(pair: TradingPair): string {
    // Implementation
  }
}
```

2. Register it in `src/services/exchanges/index.ts`:

```typescript
import { NewExchangeAdapter } from './NewExchangeAdapter'

exchangeRegistry.set('newexchange', new NewExchangeAdapter())
```

## CORS Proxy

The application uses CORS proxies to fetch data from exchange APIs that don't support browser cross-origin requests. The proxy chain includes:
- corsproxy.io (primary)
- allorigins.win (fallback)

## Known Limitations

- **Geo-restrictions**: Some exchanges (Binance, Bybit) may be geo-blocked in certain regions
- **Rate Limits**: Heavy usage may trigger exchange API rate limits
- **DEX Support**: DEX exchanges cannot be exported to TradingView
- **Ticker Age Filter**: Not implemented (requires external data source for listing dates)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
