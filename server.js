import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//npm run api
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'public', 'shipments.json');
let SHIPMENTS = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const app = express();

//const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
//app.use(
//  cors({
//    origin: allowedOrigins,
//    credentials: true,
//  })
//);


app.use(express.json());
function matches(s, { q, status, mode, carrier, riskOnly }) {
  if (status && s.currentStage !== status) return false;
  if (mode && s.mode !== mode) return false;
  if (
    carrier &&
    !String(s.carrier || '')
      .toLowerCase()
      .includes(carrier.toLowerCase())
  )
    return false;
  if (q) {
    const hay = [s.shipmentId, s.customer, s.origin, s.destination].join(' ').toLowerCase();
    if (!hay.includes(q.toLowerCase())) return false;
  }
  if (riskOnly) {
    const eta = s.etaFromCarrier ? new Date(s.etaFromCarrier) : null;
    const plan = s.plannedDelivery ? new Date(s.plannedDelivery) : null;
    const simpleRisk = eta && plan && eta > plan;
    if (!simpleRisk) return false;
  }
  return true;
}

app.get('/shipments', (req, res) => {
  const {
    q = '',
    status = '',
    mode = '',
    carrier = '',
    riskOnly = 'false',
    page = '1',
    pageSize = '50',
  } = req.query;
  const filt = { q, status, mode, carrier, riskOnly: riskOnly === 'true' };

  const items = SHIPMENTS.filter((s) => matches(s, filt));
  const p = Math.max(1, parseInt(page, 10) || 1);
  const n = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 50));
  const start = (p - 1) * n;
  const out = items.slice(start, start + n);

  res.json({ items: out, page: p, pageSize: n, total: items.length });
});

app.get('/shipments/at-risk', (_req, res) => {
  const risky = SHIPMENTS.filter((s) => {
    const eta = s.etaFromCarrier ? new Date(s.etaFromCarrier) : null;
    const plan = s.plannedDelivery ? new Date(s.plannedDelivery) : null;
    return eta && plan && eta > plan;
  });
  res.json(risky);
});

app.get('/shipments/:id', (req, res) => {
  const s = SHIPMENTS.find((x) => x.shipmentId === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stub API on http://localhost:${PORT}`));
