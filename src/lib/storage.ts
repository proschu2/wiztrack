/**
 * Local storage utilities for game persistence
 * @module lib/storage
 */

import type { Game } from '@/types/game';

const GAME_STORAGE_KEY = 'wiztrack_game';

/**
 * Save the current game state to local storage.
 * 
 * @param game - The game object to save
 * @returns True if save was successful
 * 
 * @example
 * ```typescript
 * const game: Game = { /* ... *\/ };
 * const saved = saveGame(game);
 * if (saved) {
 *   console.log('Game saved successfully');
 * }
 * ```
 */
export function saveGame(game: Game): boolean {
  if (!game || typeof game !== 'object') {
    console.error('Invalid game object provided to saveGame');
    return false;
  }

  try {
    const serialized = JSON.stringify(game);
    localStorage.setItem(GAME_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game to localStorage:', error);
    return false;
  }
}

/**
 * Load a game from local storage.
 * 
 * @returns The stored game object, or null if no game found or data is invalid
 * 
 * @example
 * ```typescript
 * const game = loadGame();
 * if (game) {
 *   console.log('Found saved game:', game.id);
 * } else {
 *   console.log('No saved game found');
 * }
 * ```
 */
export function loadGame(): Game | null {
  try {
    const serialized = localStorage.getItem(GAME_STORAGE_KEY);
    
    if (!serialized) {
      return null;
    }

    const game = JSON.parse(serialized) as Game;

    // Validate required fields
    if (!isValidGame(game)) {
      console.warn('Loaded game data is invalid, clearing storage');
      clearGame();
      return null;
    }

    return game;
  } catch (error) {
    console.error('Failed to load game from localStorage:', error);
    return null;
  }
}

/**
 * Clear the stored game from local storage.
 * 
 * @returns True if clear was successful (or no game existed)
 * 
 * @example
 * ```typescript
 * clearGame();  // Removes any saved game
 * ```
 */
export function clearGame(): boolean {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear game from localStorage:', error);
    return false;
  }
}

/**
 * Check if a saved game exists in local storage.
 * 
 * @returns True if a game is saved
 */
export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(GAME_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Validate a game object has all required fields.
 * 
 * @param game - The game object to validate
 * @returns True if game has all required fields
 */
function isValidGame(game: unknown): game is Game {
  if (!game || typeof game !== 'object') {
    return false;
  }

  const g = game as Game;

  // Check required string fields
  if (typeof g.id !== 'string' || !g.id) return false;
  if (typeof g.dateCreated !== 'string' || !g.dateCreated) return false;
  if (typeof g.status !== 'string') return false;

  // Check arrays
  if (!Array.isArray(g.players)) return false;
  if (!Array.isArray(g.rounds)) return false;

  // Check settings
  if (!g.settings || typeof g.settings !== 'object') return false;
  if (typeof g.settings.playerCount !== 'number') return false;
  if (typeof g.settings.totalRounds !== 'number') return false;

  // Check currentState (new in v2)
  if (!g.currentState || typeof g.currentState !== 'object') return false;
  if (!['idle', 'bidding', 'tricks', 'complete'].includes(g.currentState.phase)) return false;

  // Validate players array structure
  for (const player of g.players) {
    if (!player || typeof player !== 'object') return false;
    if (typeof player.id !== 'string' || !player.id) return false;
    if (typeof player.name !== 'string' || !player.name) return false;
  }

  // Validate rounds array structure
  for (const round of g.rounds) {
    if (!round || typeof round !== 'object') return false;
    if (typeof round.roundNumber !== 'number') return false;
    if (typeof round.cardsDealt !== 'number') return false;
    if (typeof round.totalTricks !== 'number') return false;
    if (!['bidding', 'tricks', 'scored'].includes(round.phase)) return false;
    if (typeof round.bidsLocked !== 'boolean') return false;
    if (!Array.isArray(round.bids)) return false;
    if (typeof round.dealer !== 'number') return false;
    if (typeof round.firstBidder !== 'number') return false;
  }

  return true;
}

/**
 * Auto-save hook - wraps saveGame with console logging.
 * Use this after each round to persist game state.
 * 
 * @param game - The game object to save
 * @returns True if save was successful
 */
export function autoSave(game: Game): boolean {
  const success = saveGame(game);
  if (success) {
    console.log(`[WizTrack] Game auto-saved at ${new Date().toISOString()}`);
  } else {
    console.error('[WizTrack] Auto-save failed');
  }
  return success;
}