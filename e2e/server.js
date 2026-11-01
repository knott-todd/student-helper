// Serves the production build the way vercel.json does: real files first
// (index.html, google-callback.html, static assets), then the SPA fallback.
// /api is never served here; each test mocks it in the browser.
const path = require('path');
const express = require('express');

const root = path.join(__dirname, '..', 'build');
const port = Number(process.env.PORT || 4173);
const app = express();

app.use(express.static(root, { index: 'index.html' }));
app.get('*', (req, res) => res.sendFile(path.join(root, 'index.html')));
app.listen(port, () => console.log(`e2e server on http://localhost:${port}`));
