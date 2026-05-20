/**
 * TypeScript data models for WizTrack game
 * @module types/game
 */

/**
 * Represents a player in the game
 * @interface Player
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Display name of the player */
  name: string;
  /** Avatar emoji for the player */
  emoji: string;
}

/**
 * Represents a bid placed by a player
 * @interface Bid
 */
export interface Bid {
  /** Player who made the bid */
  playerId: string;
  /** Number of tricks the player bid to win */
  tricks: number;
}

/**
 * Represents the current state of a round
 * @interface Round
 */
export interface Round {
  /** Sequential round number (1-indexed) */
  roundNumber: number;
  /** Number of cards dealt to each player this round */
  cardsDealt: number;
  /** Total number of tricks available in the round */
  totalTricks: number;
  /** Current phase of the round */
  phase: 'bidding' | 'tricks' | 'scored';
  /** Whether bids have been locked (no more changes allowed) */
  bidsLocked: boolean;
  /** All bids placed in this round */
  bids: Bid[];
  /** Tricks won by each player this round */
  tricksWon: Record<string, number>;
  /** Index of the dealer for this round */
  dealer: number;
  /** Index of the first bidder (left of dealer) */
  firstBidder: number;
}

/**
 * Game settings that persist across rounds
 * @interface GameSettings
 */
export interface GameSettings {
  /** Number of players in the game */
  playerCount: number;
  /** Total number of rounds to play */
  totalRounds: number;
  /** Random initial dealer index (shuffled at game start) */
  initialDealer: number;
}

/**
 * Game phase states - single source of truth for navigation
 */
export type GamePhase = 
  | { phase: 'idle' }
  | { phase: 'bidding'; round: number }
  | { phase: 'tricks'; round: number }
  | { phase: 'complete' };

/**
 * Represents the overall game state
 * @interface Game
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;
  /** ISO timestamp when the game was created */
  dateCreated: string;
  /** All players in the game */
  players: Player[];
  /** Game settings */
  settings: GameSettings;
  /** All rounds in the game */
  rounds: Round[];
  /** Current status of the game */
  status: 'waiting' | 'in_progress' | 'completed';
  /** Current game phase - single source of truth for navigation */
  currentState: GamePhase;
}