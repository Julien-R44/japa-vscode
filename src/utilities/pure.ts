import type { Location } from '../ast_extractor/contracts'

/**
 * Check if the given location is within the second location.
 */
export function isWithinLocation(locA: Location, locB: Location) {
  return locA.start.line >= locB.start.line && locA.end.line <= locB.end.line
}
