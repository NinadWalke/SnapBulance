import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import MapComponent from '../../../components/MapComponent';

export interface LiveTripTrackingProps {}
 
const LiveTripTracking: React.FC<LiveTripTrackingProps> = () => {
    const { tripId } = useParams();
    const [userLocation, setUserLocation] = useState<[number, number]>([19.1973, 72.9644]);

    // Fetch location again (or grab it from a global state/context later)
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    return ( 
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto', border: '1px solid #ddd' }}>
            
            {/* Map Area */}
            <div style={{ flex: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Trip ID: {tripId}
                </div>
                
                {/* Reusing the exact same map component */}
                <MapComponent 
                    center={userLocation} 
                    zoom={15} 
                    markers={[{ position: userLocation, label: 'Pickup Point' }]} 
                />
            </div>

            {/* Bottom Sheet / Driver Info */}
            <div style={{ flex: 1, padding: '1.5rem', background: 'white', borderTop: '1px solid #ccc', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.2rem 0', color: '#333' }}>Arriving in 5 mins</h2>
                        <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>Ambulance is En Route</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', background: '#f5f5f5', padding: '0.3rem 0.6rem', border: '1px solid #ddd', borderRadius: '4px', display: 'inline-block' }}>MH-04-AB-1234</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Mercedes Sprinter (ALS)</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ flex: 1, padding: '1rem', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
                        📞 Call Driver
                    </button>
                    <button style={{ flex: 1, padding: '1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        📍 Share Status
                    </button>
                </div>
            </div>
        </div>
     );
}
 
export default LiveTripTracking;