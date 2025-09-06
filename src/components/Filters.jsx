import React from 'react'

export default function Filters({ q, setQ, status, setStatus, mode, setMode, carrier, setCarrier, riskOnly, setRiskOnly, onRefresh, auto, setAuto, intervalSec, setIntervalSec }) {
  return (
    <div className="controls">
      <input placeholder="Search id / customer / route" value={q} onChange={e=>setQ(e.target.value)} />
      <select value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">All statuses</option>
        <option value="created">Created</option>
        <option value="picked_up">Picked Up</option>
        <option value="in_transit">In Transit</option>
        <option value="at_customs">At Customs</option>
        <option value="out_for_delivery">Out for Delivery</option>
        <option value="delivered">Delivered</option>
      </select>
      <select value={mode} onChange={e=>setMode(e.target.value)}>
        <option value="">All modes</option>
        <option value="air">Air</option>
        <option value="sea">Sea</option>
        <option value="road">Road</option>
        <option value="rail">Rail</option>
      </select>
      <input placeholder="Carrier" value={carrier} onChange={e=>setCarrier(e.target.value)} />
      <label className="flex"><input type="checkbox" checked={riskOnly} onChange={e=>setRiskOnly(e.target.checked)} /> Risk only</label>
      <div className="flex">
        <button className="btn" onClick={onRefresh}>Refresh</button>
        <label className="flex small" title="Auto-refresh">
          <input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)} />
          Auto {auto ? `(${intervalSec}s)` : ''}
        </label>
        <input type="number" min="5" max="120" value={intervalSec} onChange={e=>setIntervalSec(Number(e.target.value||30))} />
      </div>
    </div>
  )
}
