import type { Location } from '../ast_extractor/contracts'

/**
 * Check if the given location is within the second location.
 */
export function isWithinLocation(locA: Location, locB: Location) {
  return locA.start.line >= locB.start.line && locA.end.line <= locB.end.line
}

export function unique<T>(arr: T[]) {
  return Array.from(new Set(arr)).filter(Boolean)
}

export function iterableToArray<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable)
}
