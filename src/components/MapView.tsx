import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Order } from '../types';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ order, isPharmacist }: { order: Order, isPharmacist: boolean }) {
  // Mock coordinates for demonstration. In a real app, these would come from the order/profile data.
  const [position, setPosition] = useState<[number, number]>([30.0444, 31.2357]); // Cairo

  useEffect(() => {
    // Simulate real-time movement if it's out for delivery
    if (order.status === 'delivering') {
      const interval = setInterval(() => {
        setPosition(prev => [prev[0] + 0.0001, prev[1] + 0.0001]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [order.status]);

  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {isPharmacist ? "موقع المريض المستهدف" : "موقع المندوب / الصيدلي"}
            <br />
            {order.address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
