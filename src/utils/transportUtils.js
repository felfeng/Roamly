export function calculateTransportInfo(from, to) {
  const R = 6371; // Earth's radius in km
  const dLat = ((to[0] - from[0]) * Math.PI) / 180;
  const dLon = ((to[1] - from[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from[0] * Math.PI) / 180) *
      Math.cos((to[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  let method, details;
  if (distance < 1) {
    method = "Walking";
    details = `About ${Math.round(distance * 1000)} meters, ${Math.round(
      (distance * 1000) / 80
    )} minutes walk`;
  } else if (distance < 5) {
    method = "Public Transport";
    details = `Take a bus or metro for about ${Math.round(distance)} km`;
  } else {
    method = "Taxi/Ride-sharing";
    details = `Consider a taxi or ride-sharing service for this ${Math.round(
      distance
    )} km trip`;
  }

  return { distance: Number(distance.toFixed(2)), method, details };
}
