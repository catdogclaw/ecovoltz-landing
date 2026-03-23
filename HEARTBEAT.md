# HEARTBEAT.md

## Rule: Skip if No User Activity
Only run memory maintenance if there has been actual user interaction since the last heartbeat.

## Memory Auto-Save Task (When Active)
When user activity is detected:
1. Check if `memory/YYYY-MM-DD.md` exists for today
2. Read recent session messages
3. Append a brief summary — key topics, decisions, reminders set
4. Keep entries concise — 3-5 lines

## Format
```
### HH:MM — [Brief Topic]
- Decision: [what was decided]
- Action: [what was started/finished]
- Note: [anything worth remembering]
```

## Important Files
- `memory/YYYY-MM-DD.md` — daily raw logs
- `MEMORY.md` — long-term curated memory (update every few days)
