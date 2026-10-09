const FALLBACK_LINK = "https://t.me/+LWr2hcTQomQ4NmY1";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ok: false, error: "Method not allowed"});
  }

  const configured = (process.env.TELEGRAM_INVITE_LINK || "").trim();
  const url = isTelegramLink(configured) ? configured : FALLBACK_LINK;
  return res.status(200).json({url});
}

function isTelegramLink(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" &&
      (parsed.hostname === "t.me" || parsed.hostname === "telegram.me") &&
      !parsed.username &&
      !parsed.password &&
      parsed.pathname.length > 1;
  } catch (_) {
    return false;
  }
}
