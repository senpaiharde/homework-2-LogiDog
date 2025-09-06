import React from 'react'
import { isShipmentAtRisk } from '../utils/risk'

const Badge = ({ok}) => <span className={ok ? 'badge ok' : 'badge risk'}>{ok ? 'OK' : 'AT RISK'}</span>

function Row({ s }) {
  return (
    <tr>
      <td><div className="flex"><code>{s.shipmentId}</code> <Badge ok={!s._risk} /></div></td>
      <td>{s.customer}<div className="small">{s.origin}  {s.destination}</div></td>
      <td><span className="status">{s.currentStage}</span><div className="small">{s.mode} · {s.carrier}</div></td>
      <td>{s.plannedPickup?.slice(0,10)}  {s.plannedDelivery?.slice(0,10)}<div className="small">ETA: {s.etaFromCarrier?.slice(0,10) || '—'}</div></td>
      <td>
        <div className="small">lastScan: {s.lastScanAt?.replace('T',' ').slice(0,16)}</div>
        <div className="small">hubDelay: {s.hubDelayMinutes}m</div>
        <div className="small">customsHold: {String(s.customsHold)}</div>
        <div className="small">weather: {String(s.weatherAlert)}</div>
      </td>
    </tr>
  )
}

export default function Dashboard({ data }) {
  const riskCount = data.filter(d => d._risk).length
  const total = data.length
  const delivered = data.filter(d => d.currentStage === 'delivered').length
  const inTransit = data.filter(d => d.currentStage === 'in_transit').length

  return (
    <div>
      <div className="kpis">
        <div className="card"><h3>At Risk</h3><div style={{fontSize:28,fontWeight:700}}>{riskCount}</div><div className="small">{Math.round((riskCount/Math.max(1,total))*100)}% of {total}</div></div>
        <div className="card"><h3>In Transit</h3><div style={{fontSize:28,fontWeight:700}}>{inTransit}</div></div>
        <div className="card"><h3>Delivered</h3><div style={{fontSize:28,fontWeight:700}}>{delivered}</div></div>
        <div className="card"><h3>Policy</h3><div className="small">ETA Plan • Within 3d not final • Stale&gt;12h • Customs near • Hub&gt;180m • Weather</div></div>
      </div>

      <table className="table" style={{marginTop:12}}>
        <thead>
          <tr>
            <th>Shipment</th>
            <th>Customer / Route</th>
            <th>Stage</th>
            <th>Plan / ETA</th>
            <th>Signals</th>
          </tr>
        </thead>
        <tbody>
          {data.map(s => <Row key={s.shipmentId} s={s} />)}
        </tbody>
      </table>

      <div className="footer">* Demo data; policy is explainable rules suitable for MVP.</div>
    </div>
  )
}
