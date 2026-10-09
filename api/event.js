const MAX_BODY_BYTES = 16 * 1024;
const ALLOWED_EVENTS = new Set(["ViewContent", "TelegramJoinClick"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ok: false, error: "Method not allowed"});
  }

  try {
    const data = await readRequestBody(req);
    if (!data || !ALLOWED_EVENTS.has(data.type)) {
      return res.status(400).json({ok: false, error: "Invalid event"});
    }

    // This endpoint records a compact diagnostic entry in Vercel function logs.
    // Meta browser events are sent directly by the Pixel in the visitor's browser.
    console.log("landing_event", {
      type: data.type,
      vid: clean(data.vid, 160),
      eid: clean(data.eid, 200),
      source: clean(data.source, 120),
      medium: clean(data.medium, 120),
      campaign: clean(data.campaign, 200),
      ad: clean(data.ad, 200),
      term: clean(data.term, 200),
      fbclid: data.fbclid ? "[present]" : ""
    });

    return res.status(202).json({ok: true});
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return res.status(status).json({ok: false, error: status === 413 ? "Payload too large" : "Invalid request body"});
  }
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  let raw = "";
  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    raw = req.body.toString();
  } else {
    raw = await new Promise((resolve, reject) => {
      let body = "";
      let size = 0;
      let tooLarge = false;
      req.on("data", chunk => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          tooLarge = true;
        } else if (!tooLarge) {
          body += chunk;
        }
      });
      req.on("end", () => tooLarge ? reject(new Error("Payload too large")) : resolve(body));
      req.on("error", reject);
    });
  }

  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new Error("Payload too large");
  if (!raw) return null;

  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("application/json")) return JSON.parse(raw);
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  throw new Error("Unsupported content type");
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}
