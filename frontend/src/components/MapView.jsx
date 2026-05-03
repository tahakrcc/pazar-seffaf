import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const openIcon = new L.DivIcon({ className: '', html: '<div style="background:linear-gradient(135deg,#10b981,#0ea5e9);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;">P</div>', iconSize: [28, 28], iconAnchor: [14, 14] });
const closedIcon = new L.DivIcon({ className: '', html: '<div style="background:#cbd5e1;width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.15);"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
const userIcon = new L.DivIcon({ className: '', html: '<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(239,68,68,0.5);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

export default function MapView({ markets, userLoc, onMarketClick }) {
  const center = userLoc ? [userLoc.lat, userLoc.lng] : markets.length ? [markets[0].lat, markets[0].lng] : [38.35, 38.31];

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {userLoc && <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
          <Popup><b>Konumunuz</b></Popup>
        </Marker>}
        {markets.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={m.isOpen ? openIcon : closedIcon}>
            <Popup>
              <div className="map-popup">
                <h3>{m.name}</h3>
                <p>{m.district}, {m.city}</p>
                <p>{m.hours}</p>
                <p>{m.isOpen ? 'Şu an açık' : 'Kapalı'}</p>
                <button className="popup-btn" onClick={() => onMarketClick(m.id)}>Detayları Gör</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
