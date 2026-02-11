import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface DriverDashboardProps {}
 
const DriverDashboard: React.FC<DriverDashboardProps> = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState<any>(null);

    // Simulate receiving a socket event from the backend
    const simulateRequest = () => {
        setIncomingRequest({
            id: 'trip_123',
            distance: '2.5 km',
            type: 'Emergency (Cardiac)',
            location: 'Sector 4, Main Market'
        });
    };

    const handleAccept = () => {
        // In real app: Emit 'accept_trip' socket event
        navigate(`/driver/mission/${incomingRequest.id}`);
    };

    return ( 
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            {/* Header Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#666' }}>
                <span>Earnings: ₹1,200</span>
                <span>Trips: 4</span>
            </div>

            <h1>Driver Dashboard 🚑</h1>

            {/* Online/Offline Toggle */}
            <div 
                onClick={() => setIsOnline(!isOnline)}
                style={{
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: isOnline ? 'green' : '#ccc',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '2rem auto', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
            >
                {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>

            {isOnline ? (
                <p>Scanning for nearby emergencies...</p>
            ) : (
                <p>Go online to start receiving requests.</p>
            )}

            {/* DEV TOOL: Simulate Request */}
            {isOnline && !incomingRequest && (
                <button onClick={simulateRequest} style={{ marginTop: '2rem', padding: '0.5rem', border: '1px dashed grey' }}>
                    (Dev) Simulate Incoming Request
                </button>
            )}

            {/* INCOMING REQUEST MODAL (Simple Overlay) */}
            {incomingRequest && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'white', borderTop: '4px solid red', padding: '2rem',
                    boxShadow: '0 -5px 20px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ color: 'red', margin: 0 }}>🚨 NEW EMERGENCY</h2>
                    <h3 style={{ margin: '0.5rem 0' }}>{incomingRequest.type}</h3>
                    <p>📍 {incomingRequest.location} ({incomingRequest.distance})</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={() => setIncomingRequest(null)} style={{ flex: 1, padding: '1rem', background: '#ccc', border: 'none' }}>
                            Decline
                        </button>
                        <button onClick={handleAccept} style={{ flex: 1, padding: '1rem', background: 'green', color: 'white', border: 'none', fontWeight: 'bold' }}>
                            ACCEPT RIDE
                        </button>
                    </div>
                </div>
            )}
        </div>
     );
}
 
export default DriverDashboard;