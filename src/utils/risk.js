export const RISK_CONFIG = {
  daysWindow: 3, // plannedDelivery within 3 days and not near-final stage
  staleTransitHours: 12, // last scan older than 12 hours while in_transit
  hubDelayMinutes: 180, // accumulated hub delay threshold
  customsWindowDays: 5, // customs hold with delivery within 5 days
};

const withinDays = (dateStr, days) => {
  if (!dateStr) return false;
  const now = new Date();
  const d = new Date(dateStr);
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

const hoursSince = (dateStr) => {
  if (!dateStr) return Infinity;
  const now = new Date();
  const d = new Date(dateStr);
  return (now - d) / (1000 * 60 * 60);
};

export function isShipmentAtRisk(sh) {
  
  const stage = sh.currentStage || sh.status || '';
  const plannedDelivery = sh.plannedDelivery;
  const lastScanAt = sh.lastScanAt;
  const hasWeather = Boolean(sh.weatherAlert);
  const customsHold = Boolean(sh.customsHold);
  const hubDelay = Number(sh.hubDelayMinutes || 0);
  const eta = sh.etaFromCarrier ? new Date(sh.etaFromCarrier) : null;
  const plan = plannedDelivery ? new Date(plannedDelivery) : null;

  
  if (eta && plan && eta > plan) return true;

  
  if (
    withinDays(plannedDelivery, RISK_CONFIG.daysWindow) &&
    !['out_for_delivery', 'delivered'].includes(stage)
  )
    return true;

  
  if (stage === 'in_transit' && hoursSince(lastScanAt) > RISK_CONFIG.staleTransitHours) return true;

  
  if (customsHold && withinDays(plannedDelivery, RISK_CONFIG.customsWindowDays)) return true;


  if (hubDelay >= RISK_CONFIG.hubDelayMinutes) return true;

  
  if (hasWeather) return true;

  return false;
}
