import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseHumanVolume, formatVolume } from '@/utils/volume'
import { useState } from 'react'
import type { MarketType } from '@/services/exchanges'

export function FilterPanel() {
  const {
    filters,
    setMinVolume,
    toggleMarketType,
    setSearchQuery,
    resetFilters,
    pairs,
    getFilteredPairs,
  } = useAppStore()

  const [volumeInput, setVolumeInput] = useState(
    filters.minVolume ? formatVolume(filters.minVolume) : ''
  )

  const filteredPairs = getFilteredPairs()

  const handleVolumeChange = (value: string) => {
    setVolumeInput(value)
    const parsed = parseHumanVolume(value)
    setMinVolume(parsed)
  }

  const marketTypeOptions: { value: MarketType; label: string }[] = [
    { value: 'futures', label: 'Futures' },
    { value: 'spot', label: 'Spot' },
  ]

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Symbol</Label>
          <Input
            id="search"
            placeholder="e.g., BTC, ETH"
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Volume Filter */}
        <div className="space-y-2">
          <Label htmlFor="minVolume">Minimum Volume</Label>
          <Input
            id="minVolume"
            placeholder="e.g., 500K, 1M, 10M"
            value={volumeInput}
            onChange={(e) => handleVolumeChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use K for thousands, M for millions, B for billions
          </p>
        </div>

        {/* Market Type */}
        <div className="space-y-2">
          <Label>Market Type</Label>
          <div className="space-y-2">
            {marketTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={`market-${option.value}`}
                  checked={filters.marketTypes.includes(option.value)}
                  onCheckedChange={() => toggleMarketType(option.value)}
                />
                <Label
                  htmlFor={`market-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button variant="outline" onClick={resetFilters} className="w-full">
          Reset Filters
        </Button>

        {/* Stats */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredPairs.length}</span> of{' '}
            <span className="font-medium text-foreground">{pairs.length}</span> pairs
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
