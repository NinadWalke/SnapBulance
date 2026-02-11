import * as React from 'react';
import { Link } from 'react-router-dom';

export interface LookingForDriverProps {}
 
const LookingForDriver: React.FC<LookingForDriverProps> = () => {
    return ( 
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>🔍 Looking for Driver...</h1>
            
            <div style={{ margin: '2rem auto', height: '150px', width: '150px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Pulsing Animation Placeholder</p>
            </div>

            <p>Scanning nearby ambulances (Radius: 2km)...</p>
            
            {/* Simulation Button for Development Flow */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.8rem' }}>Dev Mode: Simulate Backend Match</p>
                <Link to="/user/track/trip_123">
                    <button style={{ padding: '0.5rem 1rem', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Simulate "Driver Found"
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default LookingForDriver;