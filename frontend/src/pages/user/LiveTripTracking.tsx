import * as React from 'react';
import { useParams } from 'react-router-dom';

export interface LiveTripTrackingProps {}
 
const LiveTripTracking: React.FC<LiveTripTrackingProps> = () => {
    const { tripId } = useParams();

    return ( 
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            {/* Map Area */}
            <div style={{ flex: 2, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2>🗺️ Live Map Placeholder</h2>
                <p>(Showing Trip ID: {tripId})</p>
            </div>

            {/* Bottom Sheet / Driver Info */}
            <div style={{ flex: 1, padding: '1.5rem', background: 'white', borderTop: '2px solid #ccc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <h3>Arriving in 5 mins</h3>
                        <p style={{ color: 'green' }}>Ambulance is En Route</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3>🚑 MH-04-AB-1234</h3>
                        <p>Mercedes Sprinter (ALS)</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ flex: 1, padding: '0.8rem', background: '#ddd' }}>Call Driver</button>
                    <button style={{ flex: 1, padding: '0.8rem', background: '#ff4444', color: 'white' }}>Share Live Status</button>
                </div>
            </div>
        </div>
     );
}
 
export default LiveTripTracking;