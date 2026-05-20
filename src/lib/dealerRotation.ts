/**
 * Dealer rotation utilities for Wizard card game
 * @module lib/dealerRotation
 */

/**
 * Get the index of the next dealer in clockwise rotation.
 * 
 * In Wizard, the dealer rotates clockwise after each round.
 * 
 * @param currentDealer - Index of the current dealer (0-indexed)
 * @param playerCount - Total number of players
 * @returns Index of the next dealer
 * 
 * @example
 * ```typescript
 * getNextDealer(0, 4);  // Returns 1 (Player 2 becomes dealer)
 * getNextDealer(3, 4);  // Returns 0 (wraps around to Player 1)
 * getNextDealer(5, 6);  // Returns 0
 * ```
 */
export function getNextDealer(currentDealer: number, playerCount: number): number {
  if (currentDealer < 0 || currentDealer >= playerCount) {
    throw new Error('Current dealer index is out of bounds');
  }
  if (playerCount < 2) {
    throw new Error('Player count must be at least 2');
  }

  return (currentDealer + 1) % playerCount;
}

/**
 * Get the index of the first bidder (player to the left of the dealer).
 * 
 * In Wizard, bidding starts with the player to the left of the dealer.
 * The dealer bids last.
 * 
 * @param dealerIndex - Index of the dealer (0-indexed)
 * @param playerCount - Total number of players
 * @returns Index of the first bidder
 * 
 * @example
 * ```typescript
 * // In a 4-player game with dealer at index 0:
 * getFirstBidder(0, 4);  // Returns 1 (Player 2 bids first)
 * 
 * // Dealer at index 2:
 * getFirstBidder(2, 4);  // Returns 3 (Player 4 bids first)
 * ```
 */
export function getFirstBidder(dealerIndex: number, playerCount: number): number {
  if (dealerIndex < 0 || dealerIndex >= playerCount) {
    throw new Error('Dealer index is out of bounds');
  }
  if (playerCount < 2) {
    throw new Error('Player count must be at least 2');
  }

  // First bidder is immediately clockwise from dealer
  return (dealerIndex + 1) % playerCount;
}

/**
 * Get a random initial dealer index.
 * Used at game start to randomly determine who deals first.
 * 
 * @param playerCount - Total number of players
 * @returns Random index from 0 to playerCount - 1
 */
export function getRandomInitialDealer(playerCount: number): number {
  if (playerCount < 3 || playerCount > 6) {
    throw new Error('Player count must be between 3 and 6');
  }
  return Math.floor(Math.random() * playerCount);
}

/**
 * Get the complete bidding order for a round.
 * 
 * @param dealerIndex - Index of the dealer (0-indexed)
 * @param playerCount - Total number of players
 * @returns Array of player indices in bidding order (first bidder first)
 * 
 * @example
 * ```typescript
 * // 4 players, dealer at index 0
 * getBiddingOrder(0, 4);  // Returns [1, 2, 3, 0]
 * // Dealer (0) bids last
 * ```
 */
export function getBiddingOrder(dealerIndex: number, playerCount: number): number[] {
  if (dealerIndex < 0 || dealerIndex >= playerCount) {
    throw new Error('Dealer index is out of bounds');
  }
  if (playerCount < 2) {
    throw new Error('Player count must be at least 2');
  }

  const order: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    const playerIndex = (dealerIndex + 1 + i) % playerCount;
    order.push(playerIndex);
  }

  // Last player in order is the dealer
  return order;
}