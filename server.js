const http = require("http");
const path = require("path");
const fs = require("fs");
const { URL } = require("url");
const os = require("os");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const CSV_PATH = path.join(DATA_DIR, "contact-submissions.csv");
let activeCsvPath = CSV_PATH;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

ensureDataStore();

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/contact") {
    return handleContactSubmission(req, res);
  }

  if (req.method === "OPTIONS" && req.url === "/api/contact") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    return res.end();
  }

  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function serveStatic(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let safePath = path.normalize(parsedUrl.pathname);
  if (safePath === "/" || safePath === "") {
    safePath = "/index.html";
  }

  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

function handleContactSubmission(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1e6) {
      req.socket.destroy();
    }
  });

  req.on("end", () => {
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON payload." }));
      return;
    }

    const { name, email, phone, message } = payload;
    if (!name || !email || !message) {
      res.writeHead(422, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Please provide at least name, email, and message.",
        }),
      );
      return;
    }

    const record = {
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: phone || "",
      message,
    };

    appendSubmission(record, (appendErr) => {
      if (appendErr) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unable to save submission." }));
        return;
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
  });
}

function ensureDataStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(CSV_PATH)) {
      const header = "timestamp,name,email,phone,message\n";
      fs.writeFileSync(CSV_PATH, header, "utf8");
    }
    activeCsvPath = CSV_PATH;
  } catch (err) {
    console.warn(
      `Unable to set up data directory at ${DATA_DIR}. Falling back to temp storage. Error: ${err.message}`,
    );
    const fallbackDir = path.join(os.tmpdir(), "solar-energy-morocco");
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    activeCsvPath = path.join(fallbackDir, "contact-submissions.csv");
    if (!fs.existsSync(activeCsvPath)) {
      const header = "timestamp,name,email,phone,message\n";
      fs.writeFileSync(activeCsvPath, header, "utf8");
    }
  }
}

function appendSubmission(record, cb) {
  const line = [
    record.timestamp,
    sanitizeCsv(record.name),
    sanitizeCsv(record.email),
    sanitizeCsv(record.phone),
    sanitizeCsv(record.message),
  ].join(",") + "\n";

  fs.appendFile(activeCsvPath, line, "utf8", cb);
}

function sanitizeCsv(value) {
  const safeValue = String(value).replace(/\r?\n|\r/g, " ").trim();
  if (safeValue.includes(",") || safeValue.includes('"')) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}
