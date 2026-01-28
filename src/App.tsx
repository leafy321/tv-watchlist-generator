import { Header } from '@/components/layout/Header'
import { ExchangeSelector } from '@/components/exchange/ExchangeSelector'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { ResultsTable } from '@/components/results/ResultsTable'

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
          <div className="lg:col-span-1">
            <FilterPanel />
          </div>

          {/* Results Table */}
          <div className="lg:col-span-3">
            <ResultsTable />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
