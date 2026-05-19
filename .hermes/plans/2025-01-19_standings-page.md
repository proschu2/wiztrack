# Add Standings/Analytics Page to WizTrack

**Goal:** Create a standalone standings page accessible at `/standings` that shows current game progress and player rankings at any time during gameplay.

## Current Context

**Existing analytics:**
- `/review` - Only shows after round completion
- `/complete` - Final game results with "View Review & Analytics" button
- No mid-game standings visibility

**Game phases:**
1. Setup (`/`) - Initial game configuration
2. Bidding (`/round/[id]`) - Players bid on tricks
3. Trick entry (`/trick/[id]`) - Record tricks won
4. Review (`/review`) - Round summary and standings
5. Complete (`/complete`) - Final results

**Problem:** Players can't check standings during bidding or trick entry phases.

## Proposed Approach

Create a new `/standings` route that:
- Shows current game state regardless of phase
- Displays player standings with scores
- Shows round-by-round breakdown
- Provides navigation back to current game phase
- Is accessible from any screen via floating button or nav link

## Implementation Plan

### 1. Create StandingsScreen Component
**File:** `src/components/StandingsScreen.tsx`

**Features:**
- Load game from localStorage
- Calculate current totals (including in-progress round if bids exist)
- Show game progress (Round X of Y)
- Display standings table sorted by score
- Round-by-round score breakdown table
- Visual indicator for current round/phase
- "Resume Game" button that routes back to current phase
- "Back to Setup" button if game not in progress

**Data to display:**
```
Player | Total | R1 | R2 | R3 | ... | Current
-------|-------|----|----|----|-----|--------
Alice  | 45    | 10 | 15 | 20 | ... | Bidding
Bob    | 32    | 5  | 12 | 15 | ... |
...
```

### 2. Create Standings Route
**File:** `src/app/standings/page.tsx`

**Simple wrapper:**
```tsx
import StandingsScreen from "@/components/StandingsScreen";

export default function StandingsPage() {
  return <StandingsScreen />;
}
```

### 3. Add Navigation Links

**Add to these screens:**
- `BiddingScreen.tsx` - "View Standings" button (top right or bottom)
- `TrickEntryScreen.tsx` - "View Standings" button
- `RoundReviewScreen.tsx` - Already shows standings, maybe link to full analytics
- `GameCompleteScreen.tsx` - Update "View Review & Analytics" to go to `/standings`

**Placement options:**
- Top-right floating button (icon only)
- Secondary button at bottom of main card
- Header nav bar if we add one

**Recommendation:** Secondary button at bottom, visible but not prominent

### 4. Track Current Game Phase

**Problem:** Standings page needs to know where to resume to

**Solution options:**
A. Add `currentPhase` and `currentRound` to Game state in localStorage
B. Derive from game state:
   - If last round phase === 'bidding' → resume to `/round/[n]`
   - If last round phase === 'tricks' → resume to `/trick/[n]`
   - If last round phase === 'scored' and more rounds → resume to `/round/[n+1]`
   - If all rounds done → resume to `/complete`

**Recommendation:** Option B (derive from state) - cleaner, no schema change

### 5. Files to Create/Modify

**New files:**
- `src/app/standings/page.tsx`
- `src/components/StandingsScreen.tsx`

**Modify files:**
- `src/components/BiddingScreen.tsx` - Add "View Standings" button
- `src/components/TrickEntryScreen.tsx` - Add "View Standings" button
- `src/components/GameCompleteScreen.tsx` - Update analytics button route

**Optional enhancements:**
- Add header nav bar component for all game screens
- Add visual charts (progress bars, mini sparklines)
- Export game data as CSV/JSON

### 6. Implementation Steps

1. **Create StandingsScreen component**
   - Load game from storage
   - Calculate standings for all scored rounds
   - Handle in-progress round (show bids if phase=bidding)
   - Build standings table
   - Build round-by-round breakdown
   - Implement resume logic

2. **Create standings route**
   - Simple page wrapper

3. **Add navigation buttons**
   - Update BiddingScreen with "View Standings" button
   - Update TrickEntryScreen with "View Standings" button
   - Update GameCompleteScreen button to point to `/standings`

4. **Test flow:**
   - Start game → Go to standings (should show 0/complete)
   - Bid on round 1 → Go to standings (should show round 1 bids)
   - Complete round 1 → Go to standings (should show round 1 scores)
   - Mid-round → Go to standings → Resume (should return to bidding/tricks)
   - Game complete → Go to standings (should show final results)

## Validation

**Test scenarios:**
- [ ] Standings accessible from home (no game) → Shows "No game in progress"
- [ ] Standings during bidding → Shows bids, "Resume" goes to bidding
- [ ] Standings during tricks → Shows bids + current tricks entry, "Resume" goes to tricks
- [ ] Standings after completed round → Shows all scored rounds
- [ ] Standings at game end → Shows final rankings
- [ ] Resume button works correctly from all phases
- [ ] Navigation works from bidding, tricks, review screens
- [ ] Rankings sort correctly (highest score first)
- [ ] Tie handling in rankings works

**Edge cases:**
- No game in localStorage → Redirect to `/`
- Corrupted game data → Show error, offer to clear storage
- Game with 0 rounds → Show empty state
- In-progress round with no bids yet → Show "Round in progress"

## Open Questions

1. **Visual design:** Simple table or add visual indicators (colors, bars)?
2. **Round breakdown:** Show every round or just last 5 rounds?
3. **In-progress round:** Show bids if phase=bidding, or only scored rounds?
4. **Mobile layout:** Tables get wide on mobile - need horizontal scroll or stacked layout?

## Risks & Tradeoffs

**Risks:**
- Resume logic might be complex with multiple phases
- Standings calculation needs to handle partial round data carefully

**Tradeoffs:**
- Simple tables vs. rich visualizations (start simple, enhance later)
- Always-accessible vs. phase-gated (chosen: always accessible)
- Derive current phase vs. store it (chosen: derive to avoid schema changes)

## Timeline Estimate

- StandingsScreen component: 30-45 min
- Route creation: 5 min
- Navigation updates: 15-20 min
- Testing & refinement: 20-30 min
- **Total:** ~1.5-2 hours

## Post-Launch Enhancements

- Visual charts (bar charts showing scores over rounds)
- Player performance insights (bid accuracy trends)
- Export game history
- Dark mode toggle for standings page
- Print-friendly standings view
