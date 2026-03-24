# Telegram Bot API — Direct Message Technique

**Problem:** `sessions_send` to Telegram sessions routes replies back to webchat instead of the actual Telegram chat (dmScope bug).

**Solution:** Use Telegram Bot API directly via curl.

## Send to John (8790093946)
```bash
curl -s "https://api.telegram.org/bot8715752395:AAHbzHbTSdoB7aqTG1KASucCUa0mEUg2fhI/sendMessage" \
  -d "chat_id=8790093946&text=Your message here"
```

## Send to Melissa (8774928535)
```bash
curl -s "https://api.telegram.org/bot8715752395:AAHbzHbTSdoB7aqTG1KASucCUa0mEUg2fhI/sendMessage" \
  -d "chat_id=8774928535&text=Your message here"
```

## Notes
- Bot token: `8715752395:AAHbzHbTSdoB7aqTG1KASucCUa0mEUg2fhI`
- This is reliable; sessions_send is not for outbound Telegram messages
- Session history shows inbound messages fine — outbound is the issue
