import { Header } from '@/components/layout/Header'
import { ExchangeSelector } from '@/components/exchange/ExchangeSelector'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { ResultsTable } from '@/components/results/ResultsTable'
import { ExportPanel } from '@/components/export/ExportPanel'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Exchange Selector */}
        <div className="mb-6">
          <ExchangeSelector />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1 space-y-6">
            <FilterPanel />
            <ExportPanel />
          </div>

          {/* Results Table */}
          <div className="lg:col-span-3">
            <ResultsTable />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          TradingView Watchlist Generator - Fetch pairs from MEXC and Hyperliquid
        </div>
      </footer>
    </div>
  )
}

export default App
