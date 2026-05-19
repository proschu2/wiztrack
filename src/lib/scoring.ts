/**
 * Scoring engine for Wizard card game
 * @module lib/scoring
 */

/**
 * Result of a round score calculation
 * @interface RoundScoreResult
 */
export interface RoundScoreResult {
  /** Points earned this round (can be negative) */
  points: number;
  /** Whether the bid was made exactly */
  isExact: boolean;
  /** Difference between bid and actual tricks (positive = over, negative = under) */
  difference: number;
}

/**
 * Calculate the score for a round based on bid and tricks won.
 * 
 * Scoring rules:
 * - Exact bid (made exactly): +2 + (bid amount) points
 * - Over bid: -(difference) points (1 point per trick over)
 * - Under bid: -(difference) points (1 point per trick under)
 * 
 * @param bid - Number of tricks the player committed to win
 * @param tricksWon - Number of tricks actually won
 * @returns Score result with points and metadata
 * 
 * @example
 * ```typescript
 * // Made exact bid of 3 tricks
 * calculateRoundScore(3, 3);
 * // Returns: { points: 5, isExact: true, difference: 0 }
 * // (+2 base + 3 bid = 5 points)
 * 
 * // Over bid by 1
 * calculateRoundScore(3, 4);
 * // Returns: { points: -1, isExact: false, difference: 1 }
 * 
 * // Under bid by 2
 * calculateRoundScore(4, 2);
 * // Returns: { points: -2, isExact: false, difference: 2 }
 * ```
 */
export function calculateRoundScore(bid: number, tricksWon: number): RoundScoreResult {
  if (bid < 0) {
    throw new Error('Bid cannot be negative');
  }
  if (tricksWon < 0) {
    throw new Error('Tricks won cannot be negative');
  }

  const difference = tricksWon - bid;

  if (difference === 0) {
    // Exact bid: +2 + bid
    return {
      points: 2 + bid,
      isExact: true,
      difference: 0,
    };
  } else {
    // Over or under: -1 per trick difference
    return {
      points: -Math.abs(difference),
      isExact: false,
      difference,
    };
  }
}

/**
 * Calculate total score from an array of round scores.
 * 
 * @param roundScores - Array of round score results
 * @returns Total cumulative score
 * 
 * @example
 * ```typescript
 * const scores = [
 *   { points: 5, isExact: true, difference: 0 },
 *   { points: -1, isExact: false, difference: 1 },
 *   { points: 4, isExact: true, difference: 0 },
 * ];
 * calculateTotalScore(scores);  // Returns 8
 * ```
 */
export function calculateTotalScore(roundScores: RoundScoreResult[]): number {
  return roundScores.reduce((total, score) => total + score.points, 0);
}

/**
 * Check if a bid is valid (non-negative integer).
 * 
 * @param bid - The bid to validate
 * @returns True if bid is valid
 */
export function isValidBid(bid: number): boolean {
  return Number.isInteger(bid) && bid >= 0;
}