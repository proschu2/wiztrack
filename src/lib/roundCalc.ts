/**
 * Round calculation utilities for WizTrack
 * @module lib/roundCalc
 */

/**
 * Calculate the number of rounds based on player count.
 * 
 * In Wizard, each round corresponds to dealing cards - as the game progresses,
 * fewer cards are dealt each round until the deck is exhausted.
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

  const roundsByPlayerCount: Record<number, number> = {
    3: 20,
    4: 15,
    5: 12,
    6: 10,
  };

  return roundsByPlayerCount[playerCount];
}

/**
 * Calculate how many cards each player receives in a given round.
 * Standard Wizard deck has 60 cards total.
 * 
 * @param roundNumber - Current round number (1-indexed)
 * @param playerCount - Number of players
 * @returns Number of cards to deal this round
 * 
 * @example
 * ```typescript
 * getCardsPerPlayer(1, 4);  // Returns 15 (round 1: 60/4 = 15)
 * getCardsPerPlayer(5, 4);  // Returns 12
 * getCardsPerPlayer(10, 4); // Returns 6
 * ```
 */
export function getCardsPerPlayer(roundNumber: number, playerCount: number): number {
  if (roundNumber < 1) {
    throw new Error('Round number must be at least 1');
  }
  if (playerCount < 3 || playerCount > 6) {
    throw new Error('Player count must be between 3 and 6');
  }

  // Cards decrease as rounds progress
  // Formula: 60 cards / playerCount - decrement per round
  const cardsPerPlayer = Math.floor(60 / playerCount) - Math.floor((roundNumber - 1) / playerCount);
  
  return Math.max(1, cardsPerPlayer);
}