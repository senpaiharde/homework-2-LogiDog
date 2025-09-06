import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { isShipmentAtRisk } from '../src/utils/risk.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, '..', 'public', 'shipments.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

// pick 3 shipments: first is likely risk, second maybe ok, third random
const picks = [data[0], data.find(s => s.currentStage === 'delivered') || data[1], data[2]]

for (const s of picks) {
  console.log(s.shipmentId, s.currentStage, 'planned:', s.plannedDelivery, 'ETA:', s.etaFromCarrier, '=> atRisk =', isShipmentAtRisk(s))
}
