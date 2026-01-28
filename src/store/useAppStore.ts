import { create } from 'zustand'
import type { TradingPair, MarketType } from '@/services/exchanges'
import { fetchPairsFromExchanges } from '@/services/exchanges'

export type SortField = 'symbol' | 'volume' | 'price' | 'change'
export type SortDirection = 'asc' | 'desc'

interface FilterState {
  minVolume: number | null
  maxVolume: number | null
  marketTypes: MarketType[]
  quoteCurrencies: string[]
  searchQuery: string
  sortBy: SortField
  sortDirection: SortDirection
}

interface AppState {
  // Exchange selection
  selectedExchanges: string[]
  setSelectedExchanges: (exchanges: string[]) => void
  toggleExchange: (exchangeId: string) => void

  // Data
  pairs: TradingPair[]
  isLoading: boolean
  error: string | null
  fetchPairs: () => Promise<void>

  // Filters
  filters: FilterState
  setMinVolume: (value: number | null) => void
  setMaxVolume: (value: number | null) => void
  setMarketTypes: (types: MarketType[]) => void
  toggleMarketType: (type: MarketType) => void
  setQuoteCurrencies: (currencies: string[]) => void
  setSearchQuery: (query: string) => void
  setSortBy: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  resetFilters: () => void

  // Computed
  getFilteredPairs: () => TradingPair[]
}

const defaultFilters: FilterState = {
  minVolume: null,
  maxVolume: null,
  marketTypes: ['futures'],
  quoteCurrencies: ['USDT', 'USDC', 'USD'],
  searchQuery: '',
  sortBy: 'volume',
  sortDirection: 'desc',
}

export const useAppStore = create<AppState>((set, get) => ({
  // Exchange selection
  selectedExchanges: ['mexc'],
  setSelectedExchanges: (exchanges) => set({ selectedExchanges: exchanges }),
  toggleExchange: (exchangeId) =>
    set((state) => ({
      selectedExchanges: state.selectedExchanges.includes(exchangeId)
        ? state.selectedExchanges.filter((id) => id !== exchangeId)
        : [...state.selectedExchanges, exchangeId],
    })),

  // Data
  pairs: [],
  isLoading: false,
  error: null,
  fetchPairs: async () => {
    const { selectedExchanges, filters } = get()
    if (selectedExchanges.length === 0) {
      set({ pairs: [], error: 'No exchanges selected' })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const pairs = await fetchPairsFromExchanges(selectedExchanges, filters.marketTypes)
      set({ pairs, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch pairs',
        isLoading: false,
      })
    }
  },

  // Filters
  filters: defaultFilters,
  setMinVolume: (value) =>
    set((state) => ({ filters: { ...state.filters, minVolume: value } })),
  setMaxVolume: (value) =>
    set((state) => ({ filters: { ...state.filters, maxVolume: value } })),
  setMarketTypes: (types) =>
    set((state) => ({ filters: { ...state.filters, marketTypes: types } })),
  toggleMarketType: (type) =>
    set((state) => ({
      filters: {
        ...state.filters,
        marketTypes: state.filters.marketTypes.includes(type)
          ? state.filters.marketTypes.filter((t) => t !== type)
          : [...state.filters.marketTypes, type],
      },
    })),
  setQuoteCurrencies: (currencies) =>
    set((state) => ({ filters: { ...state.filters, quoteCurrencies: currencies } })),
  setSearchQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  setSortBy: (field) =>
    set((state) => ({ filters: { ...state.filters, sortBy: field } })),
  setSortDirection: (direction) =>
    set((state) => ({ filters: { ...state.filters, sortDirection: direction } })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Computed
  getFilteredPairs: () => {
    const { pairs, filters } = get()

    return pairs
      .filter((pair) => {
        // Volume filter
        if (filters.minVolume !== null && pair.volume24h < filters.minVolume) {
          return false
        }
        if (filters.maxVolume !== null && pair.volume24h > filters.maxVolume) {
          return false
        }

        // Market type filter
        if (
          filters.marketTypes.length > 0 &&
          !filters.marketTypes.includes(pair.marketType)
        ) {
          return false
        }

        // Quote currency filter
        if (
          filters.quoteCurrencies.length > 0 &&
          !filters.quoteCurrencies.includes(pair.quoteAsset)
        ) {
          return false
        }

        // Search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toUpperCase()
          if (
            !pair.symbol.toUpperCase().includes(query) &&
            !pair.baseAsset.toUpperCase().includes(query)
          ) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        let comparison = 0
        switch (filters.sortBy) {
          case 'volume':
            comparison = a.volume24h - b.volume24h
            break
          case 'price':
            comparison = a.price - b.price
            break
          case 'change':
            comparison = a.priceChange24h - b.priceChange24h
            break
          case 'symbol':
            comparison = a.symbol.localeCompare(b.symbol)
            break
        }
        return filters.sortDirection === 'desc' ? -comparison : comparison
      })
  },
}))
