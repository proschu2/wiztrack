/**
 * Round calculation utilities for WizTrack
 * @module lib/roundCalc
 */

/**
 * Calculate the number of rounds based on player count.
 * 
 * Rule: Round X, each player gets X cards (n * X cards used).
 * The deck replenishes between rounds.
 * Max round = floor(60 / n) where n is player count.
 * 
 * @param playerCount - Number of players (3-6)
 * @returns Number of rounds for the game
 * 
 * @example
 * ```typescript
 * calculateRounds(3);  // Returns 20
 * calculateRounds(4);  // Returns 15
 * calculateRounds(5);  // Returns 12
 * calculateRounds(6);  // Returns 10
 * ```
 * 
 * @throws {Error} If playerCount is not between 3 and 6
 */
export function calculateRounds(playerCount: number): number {
  if (playerCount < 3 || playerCount > 6) {
    throw new Error('Player count must be between 3 and 6');
  }

  return Math.floor(60 / playerCount);
}

/**
 * Calculate how many cards each player receives in a given round.
 * 
 * Rule: Round X has X cards per player.
 * Round 1 = 1 card, Round 2 = 2 cards, etc.
 * 
 * @param roundNumber - Current round number (1-indexed)
 * @returns Number of cards to deal this round
 * 
 * @example
 * ```typescript
 * getCardsPerPlayer(1);  // Returns 1
 * getCardsPerPlayer(5);  // Returns 5
 * getCardsPerPlayer(15); // Returns 15
 * ```
 */
export function getCardsPerPlayer(roundNumber: number): number {
  if (roundNumber < 1) {
    throw new Error('Round number must be at least 1');
  }

  return roundNumber;
}