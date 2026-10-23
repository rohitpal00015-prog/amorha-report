module.exports = async function handler(req, res) {
  // Allow health check / status via GET
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      service: "amorha-visit-tracker",
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = (process.env.TELEGRAM_BOT_TOKEN || "8014686098:AAEvsZvlzeutQ9wS7LXUG3nXfTigd4_C9UA").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || "5407098775").trim();

  if (!token || !chatId) {
    return res.status(500).json({ error: "Missing Telegram configuration" });
  }

  let b = req.body || {};
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch {
      b = {};
    }
  }

  const clean = (v, max = 300) =>
    typeof v === "string" && v.trim().length > 0
      ? v.replace(/[\r\n]/g, " ").slice(0, max)
      : "Unavailable";

  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : clean(req.headers["x-real-ip"] || req.connection?.remoteAddress, 80);

  const country = clean(req.headers["x-vercel-ip-country"], 40);
  const city = clean(req.headers["x-vercel-ip-city"], 50);
  const region = clean(req.headers["x-vercel-ip-country-region"], 50);
  const location = (country !== "Unavailable" || city !== "Unavailable")
    ? `${city !== "Unavailable" ? city + ", " : ""}${region !== "Unavailable" ? region + ", " : ""}${country}`
    : "Unavailable";

  const screenData = typeof b.screen === "object" && b.screen !== null
    ? `${b.screen.width || 0} x ${b.screen.height || 0} (Color: ${b.screen.colorDepth || 24}-bit, DPR: ${b.screen.pixelRatio || 1})`
    : (typeof b.screen === "string" ? b.screen : "Unavailable");

  const viewportData = typeof b.viewport === "object" && b.viewport !== null
    ? `${b.viewport.width || 0} x ${b.viewport.height || 0}`
    : (typeof b.viewport === "string" ? b.viewport : "Unavailable");

  const caps = typeof b.capabilities === "object" && b.capabilities !== null ? b.capabilities : {};

  const message = [
    "🛡 AMORHA REPORT — VISIT ALERT",
    "━━━━━━━━━━━━━━━━━━━━",
    `Event ID: ${clean(b.eventId, 60)}`,
    `Server Time: ${new Date().toISOString()}`,
    `Client Time: ${clean(b.clientTimestamp || b.timestamp, 60)}`,
    `Event: ${clean(b.eventType || "PAGE_VISIT", 40)}`,
    "",
    "📍 NETWORK & LOCATION",
    `IP: ${clean(ip, 80)}`,
    `Location: ${location}`,
    `Request ID: ${clean(req.headers["x-vercel-id"], 120)}`,
    "",
    "🌐 BROWSER & SYSTEM",
    `User-Agent: ${clean(b.userAgent, 350)}`,
    `Platform: ${clean(b.platform, 100)}`,
    `Language: ${clean(b.language, 50)}`,
    `Languages: ${clean(Array.isArray(b.languages) ? b.languages.join(", ") : b.languages)}`,
    `Timezone: ${clean(b.timezone, 100)}`,
    "",
    "🖥 DISPLAY & VIEWPORT",
    `Screen: ${screenData}`,
    `Viewport: ${viewportData}`,
    "",
    "⚙ CAPABILITIES & SOURCE",
    `Cookies Enabled: ${Boolean(caps.cookiesEnabled)}`,
    `Online: ${Boolean(caps.online !== false)}`,
    `Touch Points: ${Number(caps.touchPoints) || 0}`,
    `Referrer: ${clean(b.referrerOrigin || b.referrer, 150)}`,
    `Page URL: ${clean(b.pagePath || b.url, 200)}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "Amorha Security Demonstration"
  ].join("\n");

  try {
    const tg = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const tgData = await tg.json().catch(() => ({}));

    if (!tg.ok) {
      console.error("Telegram API response error:", tgData);
      return res.status(502).json({ error: "Telegram delivery failed", details: tgData });
    }

    return res.status(200).json({ success: true, messageId: tgData.result?.message_id });
  } catch (err) {
    console.error("Telegram request exception:", err);
    return res.status(502).json({ error: "Telegram request failed", details: err.message });
  }
};
