# homeWork — roi of shipments (MVP)

A focused MVP for the CereBI intern assignment: analyze delay factors, propose early detection logic, design a primary alerts screen, prepare sample data & API spec, and implement a simple risk function.

##  What’s included

- **Approach & analysis** (below): problem understanding, delay logic, data signals, rule vs ML.
- **UI**: React dashboard with search/filters, risk badges, KPIs, auto-refresh polling.
- **Sample data**: `public/shipments.json` (≥ 15 shipments with varied risk scenarios).
- **API design**: `docs/openapi.yaml` with `/shipments`, `/shipments/at-risk`, `/shipments/{id}`.
- **Risk logic**: `src/utils/risk.js` + demo runner `npm run demo`.
- **Dev UX**: Vite + React, zero back-end needed for demo.

---

##  Quick start

```bash

npm i

#  Run the app (http://localhost:5173)
npm run dev

npm run demo
```

---

##  What to submit

- Link to this GitHub repo.
- Screenshot of the dashboard (list of at-risk shipments visible).
- (Optional) Link to a short Loom/YouTube run-through.

---

## Problem understanding & logical solution

### Common delay factors
- **Operational**: late pickup, warehouse queue, route planning errors, hub congestion, missed connection, inaccurate ETA, capacity issues.
- **External**: weather, customs inspection/hold, strikes, traffic/road closures, geopolitical events.
- **Data/process**: stale scans, missing status updates, mis-scans, incorrect address or documents.

### Early identification logic (MVP rules)
A shipment is **at risk** if any of the following hold:
1. **ETA > Plan**: Carrier ETA is beyond plannedDelivery → risk.
2. **Close window, not final**: plannedDelivery within **3 days** AND stage ∉ {out_for_delivery, delivered}.
3. **Stale in-transit**: stage = in_transit AND lastScanAt older than **12 hours**.
4. **Customs near delivery**: customsHold = true AND plannedDelivery within **5 days**.
5. **Hub delays**: hubDelayMinutes ≥ **180**.
6. **Severe weather**: weatherAlert = true.

> Rationale: clear, explainable rules suit an MVP with no historical data; they’re auditable and easy to tune.

#### Data useful for prediction (present/collect)
- **Time windows**: plannedPickup, plannedDelivery, ETA, lastScanAt (freshness signal).
- **Stages & events**: currentStage, handoff times, exceptionsCount (process health).
- **Logistics attributes**: mode, carrier, route distance, hub sequence (risk priors).
- **External signals**: weatherAlert, strikeIndex, customsHold.
- **Performance history** (collect if available): carrier/hub on-time rates, lane-level historical delays.

#### Fields critical for future ML
- **Outcome labels**: actualDeliveryTime, delayMinutes (target variable).
- **Rich event stream**: all scans with timestamps/locations.
- **Context**: carrier, mode, hubs, distance, seasonality (month/week), weekday/hour.
- **External**: weather severity, customs hold durations.
- Why: ML needs ground truth + features with predictive variance.

#### Rule-based vs. ML
- **Rules (chosen for MVP)**:  fast, transparent, no training data;  coarser accuracy.
- **ML**:  potentially higher recall/precision;  needs historical data, MLOps, and calibration.
- **Hybrid path**: ship rules now; log outcomes to bootstrap an ML model later.



##  2 UI/UX — Dashboard

- **List** of at-risk shipments with badges.
- **Filters**: search, status, mode, carrier, risk-only toggle.
- **KPIs**: at-risk count, in-transit, delivered, policy reminder.
- **Signals** column: last scan age, hub delay minutes, customs/weather flags.
- **Real-time updates**: **polling every 15s** (reliable, simple for MVP). WebSockets/SSE can replace later.

**Data structure for display**: **Denormalized** shipment objects for read-heavy dashboard.
- Example (excerpt):
```json
{
  "shipmentId": "LDG-0001",
  "customer": "Acme",
  "origin": "FRA",
  "destination": "JFK",
  "plannedDelivery": "2025-09-08T16:00:00Z",
  "etaFromCarrier": "2025-09-09T12:00:00Z",
  "currentStage": "in_transit",
  "lastScanAt": "2025-09-05T18:20:00Z",
  "mode": "air",
  "carrier": "LH",
  "customsHold": false,
  "hubDelayMinutes": 200,
  "weatherAlert": false
}
```
- **Why denormalized?** The dashboard is read-optimized; we want single-call rendering without joins. Normalize in the operational DB, denormalize in a cached read model for the UI.

---

##  API design

See `docs/openapi.yaml` for full spec.

Key endpoints:
- `GET /shipments` — list with filters & paging.
- `GET /shipments/at-risk` — pre-filtered by risk policy.
- `GET /shipments/{id}` — details.

Communication: **HTTPS + JSON**; authentication via bearer token (future). Real-time push later via **WebSocket/SSE**.

---

## Risk logic implementation

See `src/utils/risk.js`:

```js
import { isShipmentAtRisk } from './utils/risk'

```

Demo:
```bash
npm run demo
```

This prints sampled shipments and the boolean result.

---

##  How to provide the screenshot

1. Run `npm run dev`.
2. Apply `Risk only` + maybe filter by `status: in_transit`.
3. Take a screenshot of the dashboard and include it in your submission.

---

##  Roadmap (after MVP)

- Add event timeline per shipment.
- Record outcomes to compute precision/recall of rules.
- Replace polling with SSE or WebSockets.
- Start collecting features & labels to train a baseline ML model.
- Carrier/hub benchmarks & SLA dashboards.
