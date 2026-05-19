#!/bin/bash
# WizTrack Analytics Progress Monitor
cd /home/gibberish711/dev/wiztrack

echo "🎮 WizTrack Analytics - $(date '+%H:%M:%S')"
echo "=========================================="

# Check git status
if [ -d .git ]; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")
  COMMITS=$(git log --oneline --since="1 hour ago" | wc -l)
  echo "📂 Branch: $BRANCH | Commits (1h): $COMMITS"
fi

# Count files changed in src/
if [ -d src ]; then
  MODIFIED=$(find src/ -type f -mmin -60 2>/dev/null | wc -l)
  echo "📝 Modified files (60min): $MODIFIED"
fi

echo ""
echo "📊 Progress (check /todo):"
echo "→ Run: todo"
echo "→ In Hermes: Check session progress"
