/**
 * Parse human-readable volume strings like "500K", "10M", "1.5B"
 * Returns the numeric value or null if invalid
 */
export function parseHumanVolume(volumeStr: string): number | null {
  if (!volumeStr) return null

  const cleaned = volumeStr.replace(/\s/g, '').toUpperCase()
  const match = cleaned.match(/^(\d*\.?\d*)([KMB])?$/)

  if (!match) {
    return null
  }

  const [, numberPart, suffix] = match
  const number = parseFloat(numberPart)

  if (isNaN(number)) return null

  const multipliers: Record<string, number> = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
  }

  return number * (multipliers[suffix] || 1)
}

/**
 * Format a numeric volume to human-readable string
 * e.g., 1500000 -> "1.50M"
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`
  }
  return volume.toFixed(2)
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } else if (price >= 1) {
    return price.toFixed(4)
  } else if (price >= 0.0001) {
    return price.toFixed(6)
  } else {
    return price.toExponential(4)
  }
}

/**
 * Format percentage change
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
