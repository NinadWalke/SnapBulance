import * as React from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface LookingForDriverProps {}
 
const LookingForDriver: React.FC<LookingForDriverProps> = () => {
    const navigate = useNavigate();

    // 3-second auto-redirect to simulate matching an ambulance
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/user/track/trip_123');
        }, 3000);

        return () => clearTimeout(timer); // Cleanup if unmounted early
    }, [navigate]);

    return ( 
        <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', marginTop: '10vh' }}>
            {/* Injecting keyframes for the pulsing animation */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 30px rgba(211, 47, 47, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                }
            `}</style>

            <h1 style={{ color: '#333' }}>🔍 Locating Ambulance...</h1>
            <p style={{ color: '#666' }}>Scanning a 2km radius around your location.</p>
            
            <div style={{ 
                margin: '4rem auto', 
                height: '120px', 
                width: '120px', 
                background: '#d32f2f', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                animation: 'pulse 1.5s infinite',
                color: 'white',
                fontSize: '2rem'
            }}>
                🚑
            </div>
            
            {/* Manual bypass link just in case */}
            <div style={{ marginTop: '4rem', paddingTop: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Match taking too long?</p>
                <Link to="/user/track/trip_123">
                    <button style={{ padding: '0.6rem 1.2rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Force Dev Match
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default LookingForDriver;