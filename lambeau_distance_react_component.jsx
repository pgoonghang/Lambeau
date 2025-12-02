import React, { useState, useEffect } from "react";

// LambeauDistance.jsx
// Single-file React component that shows "as-the-crow-flies" distance
// from the user's location to Lambeau Field (Green Bay, WI).
// Drop this into any React app (default export). Uses Tailwind classes for styling.

// Coordinates for Lambeau Field (latitude, longitude)
const LAMBEAU = { lat: 44.5013, lon: -88.0622 };

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(a, b) {
  // a and b are objects: { lat, lon }
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const x = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function formatDistance(km, unit) {
  if (unit === "mi") {
    const mi = km * 0.62137119223733;
    if (mi < 0.1) return `${(mi * 5280).toFixed(0)} ft`;
    if (mi < 1) return `${mi.toFixed(2)} mi`;
    return `${mi.toFixed(1)} mi`;
  } else {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(2)} km`;
    return `${km.toFixed(1)} km`;
  }
}

export default function LambeauDistance() {
  const [userPos, setUserPos] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("mi");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");

  useEffect(() => {
    // nothing on mount -- user triggers geolocation
  }, []);

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser.");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("located");
      },
      (err) => {
        setError(err.message || "Failed to get location.");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useManual = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setUserPos({ lat, lon });
      setStatus("located");
      setError(null);
    } else {
      setError("Please enter valid numeric latitude and longitude.");
    }
  };

  const clear = () => {
    setUserPos(null);
    setManualLat("");
    setManualLon("");
    setError(null);
    setStatus("idle");
  };

  const distanceKm = userPos ? haversineDistanceKm(userPos, LAMBEAU) : null;

  // Simple bearing calculation (useful if you want a quick direction)
  function bearingDeg(a, b) {
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const dLon = toRad(b.lon - a.lon);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Distance to Lambeau Field</h1>
        <p className="text-sm text-slate-600 mb-4">As-the-crow-flies distance to Lambeau Field (Green Bay, WI).</p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg border hover:shadow-sm"
              onClick={getGeolocation}
            >
              Use my device location
            </button>
            <button
              className="px-4 py-2 rounded-lg border hover:shadow-sm"
              onClick={clear}
            >
              Clear
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-2 py-1 border rounded">
                <option value="mi">Miles</option>
                <option value="km">Kilometers</option>
              </select>
            </div>
          </div>

          <div className="p-3 border rounded">
            <div className="text-sm text-slate-700 mb-2">Manual coordinates (lat, lon)</div>
            <div className="flex gap-2">
              <input
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="e.g. 37.7749"
                className="flex-1 px-3 py-2 border rounded"
              />
              <input
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                placeholder="e.g. -122.4194"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button onClick={useManual} className="px-4 py-2 rounded-lg border">Use</button>
            </div>
            <div className="text-xs text-slate-500 mt-2">Not sure of your coordinates? Search online for "my lat lon" and paste them here.</div>
          </div>

          <div className="p-4 rounded bg-slate-50 border">
            <div className="flex items-baseline gap-4">
              <div>
                <div className="text-xs text-slate-500">Lambeau Field</div>
                <div className="text-sm font-medium">{LAMBEAU.lat.toFixed(4)}°, {LAMBEAU.lon.toFixed(4)}°</div>
              </div>

              <div className="ml-auto text-right">
                {status === "idle" && <div className="text-sm text-slate-500">No location selected</div>}
                {status === "locating" && <div className="text-sm text-amber-600">Locating… (allow browser permission)</div>}
                {status === "error" && error && <div className="text-sm text-red-600">Error: {error}</div>}
                {userPos && (
                  <>
                    <div className="text-xs text-slate-500">You</div>
                    <div className="text-sm">{userPos.lat.toFixed(4)}°, {userPos.lon.toFixed(4)}°</div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              {distanceKm != null ? (
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Distance (great-circle)</div>
                    <div className="text-2xl font-semibold">{formatDistance(distanceKm, unit)}</div>
                    <div className="text-sm text-slate-600 mt-1">{distanceKm.toFixed(2)} km • Bearing {Math.round(bearingDeg(userPos, LAMBEAU))}°</div>
                  </div>

                  <div className="ml-auto text-right text-xs text-slate-500">
                    <div>Lambeau: Green Bay, WI</div>
                    <div className="mt-2">(44.5013°, -88.0622°)</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Distance will appear here after you supply a location.</div>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500">Notes: This is straight-line distance “as the crow flies." For driving distances or routes, integrate a routing API (Mapbox, Google Maps, OpenRouteService) on the backend.</div>
        </div>

        <div className="mt-6 text-right text-sm text-slate-400">Made for you — drop the file into a React app to run.</div>
      </div>
    </div>
  );
}
