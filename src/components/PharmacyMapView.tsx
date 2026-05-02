import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { UserProfile } from '../types';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function PharmacyMapView({ 
  pharmacists, 
  onViewPharmacist 
}: { 
  pharmacists: UserProfile[], 
  onViewPharmacist: (ph: UserProfile) => void 
}) {
  const center: [number, number] = [30.0444, 31.2357];

  return (
    <div className="w-full h-80 rounded-3xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pharmacists.map((ph, idx) => {
          // Spread them out slightly around center just for visual demo
          // In real app, they'd have true geo coordinates
          const offsetLat = center[0] + (idx * 0.005) - 0.01;
          const offsetLng = center[1] + (idx * 0.005) - 0.01;
          
          return (
            <Marker key={ph.uid} position={[offsetLat, offsetLng]}>
              <Popup>
                <div className="text-right flex flex-col gap-2">
                  <strong className="text-teal-700">{ph.pharmacyName || ph.name}</strong>
                  <span className="text-xs">{ph.pharmacyAddress || 'لا يوجد عنوان مسجل'}</span>
                  {ph.isAvailable && <span className="text-green-600 font-bold text-xs">متاح الآن</span>}
                  <button 
                    onClick={() => onViewPharmacist(ph)}
                    className="mt-2 text-[10px] bg-teal-600 text-white px-2 py-1 rounded"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
