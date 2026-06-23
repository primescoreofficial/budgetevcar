"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Pins
const startIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg text-white font-extrabold">
    S
  </div>`,
  className: "custom-start-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const destIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg text-white font-extrabold">
    D
  </div>`,
  className: "custom-dest-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const chargerIcon = (isSelected) => L.divIcon({
  html: `<div class="w-8 h-8 rounded-full ${isSelected ? "bg-orange-650 border-2 border-white ring-4 ring-orange-500/30" : "bg-[#0249ad] border-2 border-white hover:bg-blue-800"} flex items-center justify-center shadow-md text-white font-bold transition-all duration-300 transform ${isSelected ? "scale-110" : "hover:scale-110"}">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 21l-1-7H4l9-11 1 7h6l-9 11z"/>
    </svg>
  </div>`,
  className: "custom-charger-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Controller to handle viewport fitBounds and updates
function MapController({ startCoords, destCoords, routeGeometry }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size shortly after mount to ensure leaflet layout renders correctly
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 0) {
      // Fit to polyline
      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [40, 40], duration: 1.5 });
    } else if (startCoords && destCoords) {
      const bounds = L.latLngBounds([startCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
    } else if (startCoords) {
      map.flyTo(startCoords, 12, { duration: 1.0 });
    }
  }, [startCoords, destCoords, routeGeometry, map]);

  return null;
}

export default function PlannerMap({
  startCoords,
  destCoords,
  routeGeometry,
  stations = [],
  selectedStation = null,
  onSelectStation
}) {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const center = startCoords || defaultCenter;

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-slate-100 relative">
      <MapContainer
        center={center}
        zoom={startCoords ? 10 : 5}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        {/* Modern CartoDB Positron light style tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Start Location Pin */}
        {startCoords && (
          <Marker position={startCoords} icon={startIcon}>
            <Popup>
              <div className="p-1 font-bold text-slate-800 text-xs">
                🟢 Start Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Location Pin */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="p-1 font-bold text-slate-800 text-xs">
                🔴 Destination
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeGeometry && routeGeometry.length > 0 && (
          <Polyline
            positions={routeGeometry}
            color="#0249ad"
            weight={5}
            opacity={0.8}
            lineJoin="round"
          />
        )}

        {/* Charging Stations markers along the route */}
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={chargerIcon(isSelected)}
              eventHandlers={{
                click: () => onSelectStation && onSelectStation(station)
              }}
            >
              <Popup>
                <div className="p-2 text-slate-800 max-w-[200px] font-sans">
                  <h4 className="font-bold text-xs leading-tight mb-1">{station.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-1.5 leading-snug">{station.address}</p>
                  <div className="flex flex-col gap-1 text-[9px] font-semibold text-slate-650 bg-slate-50 p-1.5 rounded">
                    <span>⚡ Operator: {station.operator}</span>
                    <span>🔌 Points: {station.points}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController
          startCoords={startCoords}
          destCoords={destCoords}
          routeGeometry={routeGeometry}
        />
      </MapContainer>
    </div>
  );
}
