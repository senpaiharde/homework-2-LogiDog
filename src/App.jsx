import React, { useEffect, useMemo, useState, useCallback } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Filters from './components/Filters.jsx'
import { isShipmentAtRisk } from './utils/risk'

async function fetchShipments() {
  const res = await fetch('/shipments.json?_=' + Date.now())
  return await res.json()
}

export default function App() {
  const [shipments, setShipments] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState('')
  const [carrier, setCarrier] = useState('')
  const [riskOnly, setRiskOnly] = useState(false)
  const [auto, setAuto] = useState(true)
  const [intervalSec, setIntervalSec] = useState(15)

  const load = useCallback(async () => {
    const data = await fetchShipments()
    
    const enriched = data.map(s => ({...s, _risk: isShipmentAtRisk(s)}))
    setShipments(enriched)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!auto) return
    const id = setInterval(load, Math.max(5, intervalSec) * 1000)
    return () => clearInterval(id)
  }, [auto, intervalSec, load])

  const onRefresh = () => load()

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return shipments.filter(s => {
      if (riskOnly && !s._risk) return false
      if (status && s.currentStage !== status) return false
      if (mode && s.mode !== mode) return false
      if (carrier && !String(s.carrier||'').toLowerCase().includes(carrier.toLowerCase())) return false
      if (qq) {
        const hay = [s.shipmentId, s.customer, s.origin, s.destination].join(' ').toLowerCase()
        if (!hay.includes(qq)) return false
      }
      return true
    }).sort((a,b) => Number(b._risk) - Number(a._risk))
  }, [shipments, q, status, mode, carrier, riskOnly])

  return (
    <div>
      <header><h1>LogiDog — Early Delay Alerts</h1></header>
      <div className="container">
        <Filters
          q={q} setQ={setQ}
          status={status} setStatus={setStatus}
          mode={mode} setMode={setMode}
          carrier={carrier} setCarrier={setCarrier}
          riskOnly={riskOnly} setRiskOnly={setRiskOnly}
          onRefresh={onRefresh}
          auto={auto} setAuto={setAuto}
          intervalSec={intervalSec} setIntervalSec={setIntervalSec}
        />
        <Dashboard data={filtered} />
      </div>
    </div>
  )
}
