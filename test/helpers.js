// Starts the app on a random port with a throwaway in-memory database.
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.SEED_DEMO = 'false';

const app = require('../src/app');

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      resolve({ server, base });
    });
  });
}

async function json(base, path, options = {}) {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

module.exports = { startServer, json };
