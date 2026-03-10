import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapComponentProps {
    center: [number, number];
    zoom?: number;
    markers?: Array<{ position: [number, number]; label: string }>;
    polyline?: [number, number][]; // NEW: Array of [lat, lng] for the route
}

// NEW: Helper component to smoothly pan the map when the center prop changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        // Animate the map view to follow the moving ambulance
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom = 13, markers = [], polyline = [] }) => {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Auto-pan the map when the center changes */}
            <MapRecenter center={center} />
            
            {/* Draw the route if coordinates exist */}
            {polyline.length > 0 && (
                <Polyline 
                    positions={polyline} 
                    pathOptions={{ color: '#007bff', weight: 5, opacity: 0.7 }} 
                />
            )}

            {/* Draw the markers (Patient, Ambulance, Hospital) */}
            {markers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                    <Popup>{marker.label}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;