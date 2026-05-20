/**
 * Game state machine - transitions and navigation
 * @module lib/gameState
 */

import type { Game, GamePhase } from '@/types/game';

/**
 * Get the destination page for resuming a game
 */
export function getResumeDestination(game: Game): string {
  const state = game.currentState;

  switch (state.phase) {
    case 'idle':
      return "/round/1";
    case 'bidding':
      return `/round/${state.round}`;
    case 'tricks':
      return `/trick/${state.round}`;
    case 'complete':
      return "/complete";
    default:
      return "/round/1";
  }
}

/**
 * Get the next state after bidding is locked
 */
export function getNextStateAfterBidding(game: Game, roundNumber: number): GamePhase {
  return { phase: 'tricks', round: roundNumber };
}

/**
 * Get the next state after tricks are confirmed
 */
export function getNextStateAfterTricks(game: Game, roundNumber: number): GamePhase {
  if (roundNumber >= game.settings.totalRounds) {
    return { phase: 'complete' };
  }
  return { phase: 'bidding', round: roundNumber + 1 };
}

/**
 * Check if the user is on the correct page for the current game state
 */
export function validateCurrentPage(pathname: string, state: GamePhase): { valid: boolean; redirect?: string } {
  switch (state.phase) {
    case 'idle':
      if (pathname !== '/') {
        return { valid: false, redirect: '/' };
      }
      break;
    case 'bidding':
      if (!pathname.startsWith('/round/')) {
        return { valid: false, redirect: `/round/${state.round}` };
      }
      break;
    case 'tricks':
      if (!pathname.startsWith('/trick/')) {
        return { valid: false, redirect: `/trick/${state.round}` };
      }
      break;
    case 'complete':
      if (pathname !== '/complete' && pathname !== '/standings') {
        return { valid: false, redirect: '/complete' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Create initial game state for a new game
 */
export function createInitialGameState(roundNumber: number): GamePhase {
  return { phase: 'bidding', round: roundNumber };
}

/**
 * Get display text for the current state
 */
export function getStateDisplayText(state: GamePhase): string {
  switch (state.phase) {
    case 'idle':
      return 'Not started';
    case 'bidding':
      return `Round ${state.round} - Bidding`;
    case 'tricks':
      return `Round ${state.round} - Tricks`;
    case 'complete':
      return 'Game Complete';
    default:
      return 'Unknown';
  }
}