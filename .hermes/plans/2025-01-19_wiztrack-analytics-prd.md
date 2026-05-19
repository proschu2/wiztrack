# PRD: WizTrack Analytics & Game Management Menu

## Overview

Add a comprehensive game management menu (burger menu) and full analytics page to WizTrack, a Wizard card game score tracking app. The app currently lacks a way to view standings during gameplay, manage game state (new game, restart), and see detailed analytics. This feature replaces the current `/review` route with inline results and adds a menu-based navigation system.

## Goals

- Provide quick access to current standings during any game phase (bidding, tricks)
- Enable game management actions (new game, restart) without data loss
- Show detailed analytics with round-by-round breakdown and trends
- Replace the separate `/review` route with inline results on the trick page
- Mobile-first design with landscape option for detailed tables

## Quality Gates

These commands must pass for every user story:
- `npm run build` - Build succeeds (type checking)
- Manual verification in browser for UI stories

## User Stories

### US-001: Create burger menu component
**Description:** As a player, I want a hamburger menu in the top-left corner so that I can access game management options from any screen.

**Acceptance Criteria:**
- [ ] Create MenuModal component with mid-screen overlay (2000s old school style)
- [ ] Burger icon (≡) positioned top-left, z-index above content
- [ ] Modal opens on click, closes on backdrop click or [Close] button
- [ ] Menu items: Standings, New Game, Restart, Settings
- [ ] When on `/standings` page, "Standings" item changes to "Resume Game"
- [ ] Modal is responsive (centered on mobile, reasonable width)

### US-002: Add New Game confirmation dialog
**Description:** As a player, I want to start a new game with confirmation so that I don't accidentally lose current progress.

**Acceptance Criteria:**
- [ ] "New Game" menu item shows confirmation dialog
- [ ] Dialog message: "Are you sure? Current game will be lost."
- [ ] [Yes] button: Clears localStorage, redirects to `/` (setup page)
- [ ] [Cancel] button: Closes dialog, returns to current page
- [ ] Pre-fills player names from current game in setup inputs

### US-003: Add Restart confirmation dialog
**Description:** As a player, I want to restart the game with the same players so that I can replay without re-entering names.

**Acceptance Criteria:**
- [ ] "Restart" menu item shows confirmation dialog
- [ ] Dialog message: "Restart with same players? All rounds will be reset."
- [ ] [Yes] button: Keeps players, resets rounds array, resets status to "waiting"
- [ ] [Cancel] button: Closes dialog, returns to current page
- [ ] Game immediately ready to start Round 1 with same players

### US-004: Create /standings page with tabs
**Description:** As a player, I want a dedicated analytics page so that I can view detailed game statistics and trends.

**Acceptance Criteria:**
- [ ] Create `/standings` route with StandingsPage component
- [ ] Implement 3 tabs: Standings (default), Trends, Round by Round
- [ ] Tab 1 "Standings" shows: current rankings, player totals, current round bids
- [ ] Tab 2 "Trends" shows: SVG line chart with score evolution per round (colored lines per player)
- [ ] Tab 3 "Round by Round" shows: detailed table (rows=rounds, cols=players) with bid/tricks/points/cumulative
- [ ] Landscape mode hint for Tab 3 table (swipe/scroll for more columns)
- [ ] "Resume Game" button returns to current game phase (bidding/tricks/complete)
- [ ] Page works mid-game (shows partial data) and at game end (shows complete data)

### US-005: Implement Standings tab logic
**Description:** As a player, I want to see current rankings and scores so I know who's winning.

**Acceptance Criteria:**
- [ ] Calculate totals from completed rounds only (phase === 'scored')
- [ ] Show current round bids if in bidding/tricks phase (not counted toward total yet)
- [ ] Sort players by total score descending (highest first)
- [ ] Highlight leader in bold/gold color
- [ ] Handle tie scores (show same rank)
- [ ] Display game progress (e.g., "Round 3 of 7")

### US-006: Implement Trends tab with SVG line chart
**Description:** As a player, I want to see score evolution over rounds so I can understand momentum and trends.

**Acceptance Criteria:**
- [ ] Create SVG line chart component (zero external dependencies)
- [ ] X-axis: Round numbers (1, 2, 3, ...)
- [ ] Y-axis: Cumulative scores
- [ ] Each player: unique color line with dots at data points
- [ ] Tooltip on hover: shows player name, round, score
- [ ] Chart updates as rounds complete (shows what's played so far)
- [ ] Mobile-responsive (SVG scales, readable text)

### US-007: Implement Round by Round tab table
**Description:** As a player, I want to see detailed per-round breakdown so I can analyze each round's outcome.

**Acceptance Criteria:**
- [ ] Table structure: rounds as rows, players as columns
- [ ] Each cell shows: bid | tricks | points (e.g., "B:3 W:2 P:-1")
- [ ] Show cumulative total below each player column
- [ ] Current round: show bid if locked, or "in progress" if not
- [ ] Horizontal scroll for mobile (swipe hint: "← swipe for more →")
- [ ] Landscape rotation recommendation for easier viewing

### US-008: Add inline results to trick page
**Description:** As a player, I want to see round results immediately after entering tricks so that I don't have to navigate to a separate page.

**Acceptance Criteria:**
- [ ] After trick confirmation, show results inline on `/trick/[id]` page
- [ ] Display format: Player name, Bid, Tricks won, Points made/lost, New total
- [ ] Color coding: Green for made bid, Red for missed bid
- [ ] Show [Next Round] button below results
- [ ] Remove redirect to `/review` route
- [ ] Delete `/review` route and RoundReviewScreen component (dead code)

### US-009: Add Settings placeholder page
**Description:** As a player, I want a Settings page (placeholder) so that the menu item doesn't break.

**Acceptance Criteria:**
- [ ] Create `/settings` route with placeholder content
- [ ] Show message: "Settings coming soon!"
- [ ] [Back to Game] button returns to current phase

### US-010: Add dealer display to bidding screen
**Description:** As a player, I want to see who is the dealer and who starts bidding so that I know the turn order.

**Acceptance Criteria:**
- [ ] Show dealer icon 🎴 next to dealer's name
- [ ] Show "starts bidding" text/emoji next to first bidder
- [ ] Display at top of bidding screen (above or below player list)
- [ ] Use existing dealer rotation logic from `lib/dealerRotation.ts`

## Functional Requirements

- FR-1: Menu modal must be accessible from all game pages (setup, bidding, tricks, review, complete, standings)
- FR-2: "New Game" must preserve player names for convenience in setup form
- FR-3: "Restart" must preserve players and settings, reset only rounds and status
- FR-4: Standings page must derive current phase from game state (no new state fields needed)
- FR-5: Standings page "Resume Game" must route to correct phase (bidding → `/round/N`, tricks → `/trick/N`, complete → `/complete`)
- FR-6: Trends chart must use custom SVG (no external chart libraries)
- FR-7: Round by Round table must support horizontal scroll on mobile
- FR-8: Inline trick results must show immediately after confirmation, no page navigation
- FR-9: Delete `/review` route and all references (navigate to trick page instead)
- FR-10: All components must be mobile-first responsive

## Non-Goals (Out of Scope)

- Player Stats tab (bid accuracy, best rounds, etc.) - defer to v2
- Settings page functionality - placeholder only for now
- System theme auto-detection
- Export/share game data
- Real-time trick entry during card play (we clarified: phone goes away during play)
- Push notifications or reminders

## Technical Considerations

- **Storage:** All game state in localStorage (Game object with rounds array)
- **Current phase detection:** Derive from `game.rounds[game.rounds.length - 1].phase`
  - 'bidding' → resume to `/round/[currentRound]`
  - 'tricks' → resume to `/trick/[currentRound]`
  - 'scored' → if more rounds, `/round/[nextRound]`, else `/complete`
- **Menu modal state:** Use React state (open/close), no persistence needed
- **SVG chart:** Calculate points based on canvas width, keep math simple
- **Dependencies:** No new npm packages (use custom SVG for chart)
- **Mobile layout:** Tailwind CSS responsive utilities (md:, lg: breakpoints)
- **Navigation:** Next.js App Router with `useRouter()` hook

## File Changes

**New files:**
- `src/components/MenuModal.tsx` - Burger menu component
- `src/app/standings/page.tsx` - Standings page route
- `src/components/StandingsPage.tsx` - Main standings component with tabs
- `src/components/standings/StandingsTab.tsx` - Tab 1: Rankings
- `src/components/standings/TrendsTab.tsx` - Tab 2: SVG line chart
- `src/components/standings/RoundByRoundTab.tsx` - Tab 3: Detailed table
- `src/components/InlineResults.tsx` - Inline trick results display
- `src/app/settings/page.tsx` - Settings placeholder

**Modify files:**
- `src/components/BiddingScreen.tsx` - Add dealer display + menu button
- `src/components/TrickEntryScreen.tsx` - Add inline results + menu button, remove review redirect
- `src/components/GameCompleteScreen.tsx` - Add menu button, update analytics link
- `src/app/page.tsx` (setup) - Add menu button
- `lib/storage.ts` - Add `restartGame()` function (keep players, reset rounds)
- Delete `src/app/review/page.tsx` - Dead code
- Delete `src/components/RoundReviewScreen.tsx` - Dead code

## Success Metrics

- Menu modal opens/closes smoothly on mobile
- All menu actions work (new game, restart, standings, settings)
- Standings page shows correct data mid-game and at game end
- Trends chart renders without errors (SVG)
- Round by Round table scrolls horizontally on mobile
- Inline trick results show immediately after confirmation
- No more `/review` route in codebase
- Quality gates pass (build succeeds, manual browser verification)

## Open Questions

None - all decisions locked in through grilling session.
