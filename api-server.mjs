import { google } from 'googleapis';
import http from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'mtg-arb');
const TOKEN_PATH = join(CONFIG_DIR, 'token.json');
const CLIENT_SECRET_PATH = join(CONFIG_DIR, 'client_secret.json');

const SPREADSHEET_ID = '19xn3xX1ItpjJebzJLB01gmDcZroguMffmjd1WXROaFo';
const TABS = ['mtg', 'pokemon', 'other'];
const PORT = 3001;

function buildAuth() {
  const secret = JSON.parse(readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = secret.installed ?? secret.web;
  const oauth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
  oauth2.setCredentials(token);
  oauth2.on('tokens', (updated) => {
    const current = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
    writeFileSync(TOKEN_PATH, JSON.stringify({ ...current, ...updated }, null, 2));
  });
  return oauth2;
}

const auth = buildAuth();
const sheets = google.sheets({ version: 'v4', auth });

async function fetchTab(tabName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A2:C`,
  });
  return (res.data.values ?? []).map(([name = '', set = '', price = '']) => ({ name, set, price }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/api\/sheets\/(\w+)$/);

  res.setHeader('Content-Type', 'application/json');

  if (!match) {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  const tab = match[1];
  if (!TABS.includes(tab)) {
    res.writeHead(400);
    return res.end(JSON.stringify({ error: 'Unknown tab' }));
  }

  try {
    const data = await fetchTab(tab);
    res.writeHead(200);
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error(`Error fetching tab "${tab}":`, err.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => console.log(`API server on :${PORT}`));
