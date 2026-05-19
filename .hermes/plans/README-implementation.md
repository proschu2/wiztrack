# WizTrack Analytics & Menu - Implementation Summary

## What We're Building

Game management menu + analytics page for Wizard card game tracker.

**Key changes:**
- 🍔 Top-left burger menu → modal (Standings, New Game, Restart, Settings)
- 📊 `/standings` page with 3 tabs (Standings, Trends chart, Round-by-round table)
- 🔄 Inline trick results (delete `/review` route)
- 🎴 Dealer display on bidding screen

## Tech Stack

- **Chart:** Custom SVG (zero dependencies)
- **Storage:** localStorage (existing Game object)
- **Navigation:** Derive current phase from game state
- **Mobile-first:** Landscape option for wide tables

## File Structure

```
New files:
src/components/MenuModal.tsx
src/app/standings/page.tsx
src/components/StandingsPage.tsx
src/components/standings/StandingsTab.tsx
src/components/standings/TrendsTab.tsx (SVG chart)
src/components/standings/RoundByRoundTab.tsx
src/components/InlineResults.tsx
src/app/settings/page.tsx

Modify:
src/components/BiddingScreen.tsx (dealer + menu)
src/components/TrickEntryScreen.tsx (inline results, no review redirect)
src/components/GameCompleteScreen.tsx (menu)
src/app/page.tsx (menu)
lib/storage.ts (restartGame function)

Delete:
src/app/review/page.tsx
src/components/RoundReviewScreen.tsx
```

## User Stories (10 total)

1. Menu modal component (burger icon, mid-screen overlay)
2. New Game confirmation (pre-fill players)
3. Restart confirmation (keep players, reset rounds)
4. `/standings` page with 3 tabs
5. Standings tab logic (rankings, highlight leader)
6. Trends tab (SVG line chart)
7. Round by Round tab (detailed table)
8. Inline trick results (delete review route)
9. Settings placeholder
10. Dealer display on bidding screen

## Quality Gates

- `npm run build` (type checking)
- Manual browser verification for UI stories

## Usage with Ralph TUI

1. **Use beads workflow:**
   ```bash
   # Convert PRD to beads
   cd /home/gibberish711/dev/wiztrack

   # Ralph TUI will work through beads automatically
   ralph-tui run --tracker beads --epic wiztrack-analytics
   ```

2. **Or use PRD directly:**
   - PRD location: `.hermes/plans/2025-01-19_wiztrack-analytics-prd.md`
   - Has 10 user stories with acceptance criteria
   - Quality gates defined

## Key Decisions (from grilling)

- **Chart:** Custom SVG (tiny, zero deps)
- **Menu:** Mid-screen modal (2000s style)
- **Results:** Inline on trick page (delete `/review`)
- **Mobile:** First, landscape OK for tables
- **Access:** Burger menu top-left, no floating button
- **Analytics:** 3 tabs (Standings, Trends, Round-by-Round)
- **New Game:** Confirm → pre-fill current players
- **Restart:** Confirm → keep players, reset rounds
- **Dealer:** Show 🎴 icon + "starts bidding" text

## Dependencies

Order matters (schema/backend → UI):
1. MenuModal component (foundation)
2. Storage functions (restartGame)
3. Settings page (placeholder)
4. Standings tabs (all 3)
5. Inline results component
6. Update existing screens (add menu, dealer, remove review)
7. Delete dead code (review route, component)

## Testing Checklist

- [ ] Menu opens on all pages
- [ ] New Game confirms and pre-fills players
- [ ] Restart confirms and keeps players
- [ ] Standings page shows correct data
- [ ] All 3 tabs work (Standings, Trends, Round-by-Round)
- [ ] Trends chart renders SVG
- [ ] Round-by-Round table scrolls horizontally
- [ ] Inline results show on trick page
- [ ] Dealer display shows on bidding screen
- [ ] No `/review` route exists
- [ ] Build passes
- [ ] Manual browser verification passes
