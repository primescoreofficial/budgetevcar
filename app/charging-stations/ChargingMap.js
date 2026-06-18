"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix standard icon issue in case it's used elsewhere
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Premium Custom EV Charging Station pin using divIcon (Tailwind styling)
const createChargerIcon = (isSelected) => L.divIcon({
  html: `<div class="w-9 h-9 rounded-full ${isSelected ? "bg-orange-600 border-2 border-white ring-4 ring-orange-500/30" : "bg-blue-600 border-2 border-white hover:bg-[#0249ad]"} flex items-center justify-center shadow-lg text-white font-bold transition-all duration-300 transform ${isSelected ? "scale-110" : "hover:scale-110"}">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 21l-1-7H4l9-11 1 7h6l-9 11z"/>
    </svg>
  </div>`,
  className: "custom-charger-marker",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Premium Custom User Location marker
const userIcon = L.divIcon({
  html: `<div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg relative">
    <div class="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping"></div>
    <div class="w-2.5 h-2.5 rounded-full bg-white relative z-10"></div>
  </div>`,
  className: "custom-user-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Controller to smoothly animate pan and zoom when center shifts
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    // Force a size recalculation on mount to prevent grey/unloaded tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Watch for window resize events to trigger size recalculation
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
    if (center && center[0] && center[1]) {
      map.flyTo(center, 13, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      // Force size update shortly after flying to center
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [center, map]);
  return null;
}

export default function ChargingMap({ stations, center, userLocation, selectedStation, onSelectStation }) {
  const mapCenter = center && center.length === 2 ? center : [20.5937, 78.9629]; // Default: Center of India

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-100 relative">
      <MapContainer
        center={mapCenter}
        zoom={center ? 13 : 5}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && userLocation.lat && userLocation.lon && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <div className="p-1 font-semibold text-slate-800 text-xs">
                📍 You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Station Markers */}
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createChargerIcon(isSelected)}
              eventHandlers={{
                click: () => onSelectStation(station)
              }}
            >
              <Popup>
                <div className="p-2 text-slate-800 max-w-[200px]">
                  <h4 className="font-bold text-xs leading-tight mb-1">{station.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-1.5 leading-snug">{station.address}</p>
                  <div className="flex flex-col gap-1 text-[9px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded">
                    <span>⚡ Operator: {station.operator}</span>
                    <span>🔌 Points: {station.points}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController center={center} />
      </MapContainer>
    </div>
  );
}
