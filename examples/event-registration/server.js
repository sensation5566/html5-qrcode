const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8088;
const TOTAL_STORES = 47;
const DATA_FILE = path.join(__dirname, 'store_checkins.log');
const CHECKIN_FILE = path.join(__dirname, 'checkin.log');

let checkins = {};
let registered = new Set();

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return;
  const lines = fs.readFileSync(DATA_FILE, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const { id, store } = JSON.parse(line);
      if (typeof id !== 'string' || typeof store !== 'number') continue;
      if (!checkins[id]) {
        checkins[id] = new Array(TOTAL_STORES).fill(false);
      }
      checkins[id][store - 1] = true;
    } catch (e) {
      console.warn('Ignored bad line in log:', line);
    }
  }
}

function loadRegistered() {
  if (!fs.existsSync(CHECKIN_FILE)) return;
  const lines = fs.readFileSync(CHECKIN_FILE, 'utf8').split('\n');
  for (const line of lines) {
    const id = line.trim();
    if (id) registered.add(id);
  }
}

function appendEvent(id, store) {
  const time = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' })
    .replace(/-/g, '/');
  fs.appendFile(
    DATA_FILE,
    JSON.stringify({ id, store, time }) + '\n',
    err => {
      if (err) console.error('Failed to persist check-in', err);
    }
  );
}

function appendRegistered(id) {
  fs.appendFile(CHECKIN_FILE, id + '\n', err => {
    if (err) console.error('Failed to persist check-in', err);
  });
}

function send(res, status, data, contentType = 'application/json') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(contentType === 'application/json' ? JSON.stringify(data) : data);
}

function handleApi(req, res, parsed) {
  if (req.method === 'POST' && parsed.pathname === '/participant-checkin') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { id } = JSON.parse(body || '{}');
        if (typeof id !== 'string') {
          send(res, 400, { error: 'invalid request' });
          return;
        }
        if (!registered.has(id)) {
          registered.add(id);
          appendRegistered(id);
        }
        send(res, 200, { ok: true });
      } catch (e) {
        send(res, 400, { error: 'invalid json' });
      }
    });
    return true;
  }

  if (req.method === 'POST' && parsed.pathname === '/checkin') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { id, store } = JSON.parse(body || '{}');
        if (typeof id !== 'string' || typeof store !== 'number') {
          send(res, 400, { error: 'invalid request' });
          return;
        }
        if (!registered.has(id)) {
          send(res, 200, { notCheckin: true });
          return;
        }
        if (!checkins[id]) {
          checkins[id] = new Array(TOTAL_STORES).fill(false);
        }
        const already = checkins[id][store - 1];
        if (!already) {
          checkins[id][store - 1] = true;
          appendEvent(id, store);
        }
        send(res, 200, { already, visits: checkins[id] });
      } catch (e) {
        send(res, 400, { error: 'invalid json' });
      }
    });
    return true;
  }

  if (req.method === 'GET' && parsed.pathname.startsWith('/participant/')) {
    const id = decodeURIComponent(parsed.pathname.split('/')[2] || '');
    const visits = checkins[id] || new Array(TOTAL_STORES).fill(false);
    send(res, 200, { visits });
    return true;
  }

  if (req.method === 'GET' && parsed.pathname === '/stats') {
    const totals = new Array(TOTAL_STORES).fill(0);
    const lists = Array.from({ length: TOTAL_STORES }, () => []);
    for (const id in checkins) {
      checkins[id].forEach((v, i) => {
        if (v) {
          totals[i]++;
          lists[i].push(id);
        }
      });
    }
    send(res, 200, { totals, lists });
    return true;
  }

  if (req.method === 'GET' && parsed.pathname === '/clear-localstorage') {
    const html = `<!DOCTYPE html><html><body><script>
      localStorage.clear();
      sessionStorage.clear();
      document.body.textContent = 'Local storage cleared';
    </script></body></html>`;
    send(res, 200, html, 'text/html');
    return true;
  }

  return false;
}

function serveStatic(res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(__dirname, pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.html' ? 'text/html'
      : ext === '.js' ? 'application/javascript'
      : ext === '.css' ? 'text/css'
      : 'text/plain';
    send(res, 200, data, type);
  });
}

loadData();
loadRegistered();

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 200, '');
    return;
  }

  const parsed = url.parse(req.url);
  if (!handleApi(req, res, parsed)) {
    serveStatic(res, parsed.pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
