const router = require("express").Router();

const REPORT_BASE = (process.env.REPORT_SERVICE_URL || "").replace(/\/$/, "");

function buildTargetUrl(req) {
  // req.originalUrl = /api/reports/stock-bajo  →  /reports/stock-bajo
  const forwardPath = req.originalUrl.replace(/^\/api\/reports/, "/reports");
  return `${REPORT_BASE}${forwardPath}`;
}

function copyResponseHeaders(srcHeaders, res) {
  const skip = new Set([
    "content-encoding",
    "transfer-encoding",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "upgrade",
  ]);

  for (const [k, v] of Object.entries(srcHeaders || {})) {
    if (!skip.has(k.toLowerCase()) && v != null) res.setHeader(k, v);
  }
}

async function proxy(req, res) {
  try {
    if (!REPORT_BASE) {
      return res.status(500).json({ error: "REPORT_SERVICE_URL no configurado" });
    }

    const targetUrl = buildTargetUrl(req);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const headers = {};
    if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
    if (!headers["content-type"] && !["GET", "HEAD"].includes(req.method)) {
      headers["content-type"] = "application/json";
    }

    const options = {
      method: req.method,
      headers,
      signal: controller.signal,
    };

    if (!["GET", "HEAD"].includes(req.method)) {
      options.body =
        headers["content-type"].includes("application/json")
          ? JSON.stringify(req.body ?? {})
          : req.body;
    }

    const response = await fetch(targetUrl, options);
    clearTimeout(timeout);

    res.status(response.status);
    copyResponseHeaders(Object.fromEntries(response.headers.entries()), res);

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      const data = await response.json();
      return res.json(data);
    } else {
      const buf = Buffer.from(await response.arrayBuffer());
      return res.send(buf);
    }
  } catch (err) {
    const isAbort = err?.name === "AbortError";
    return res.status(504).json({
      error: isAbort ? "Timeout" : "Error",
      details: String(err?.message || err),
    });
  }
}

router.all("/*", proxy);
router.all("/", proxy);

module.exports = router;