# Amorha Report 🛡️

A lightweight cybersecurity educational lab demonstration & telemetry logger that captures client visit metrics and sends structured alerts to a Telegram Bot in real-time.

## Features
- ⚡ **Zero-dependency serverless design** optimized for Vercel
- 📲 **Telegram Notifications**: Real-time alerts delivered to Telegram when a visitor arrives
- 🌐 **Comprehensive Metrics**: Captures IP address, location (via Vercel headers), Screen resolution, viewport, OS platform, User-Agent, language, and timezone
- 🔄 **Smooth User Experience**: Crisp Google-style loading animation with automatic redirection

## Environment Variables
Set the following environment variables in Vercel or your local `.env`:

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram Chat ID or Group ID |

## Local Development
```bash
npm start
```
Visit `http://localhost:3000` to test locally.

## Deployment
Deploy directly to Vercel:
```bash
vercel --prod
```
