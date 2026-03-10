import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export interface HospitalDashboardProps {}
 
const HospitalDashboard: React.FC<HospitalDashboardProps> = () => {
    const [incomingTrips, setIncomingTrips] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/hospitals/dashboard');
                setIncomingTrips(res.data);
            } catch (err) { console.error(err); }
        };

        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5000); // Poll for new arrivals
        return () => clearInterval(interval);
    }, []);

    return ( 
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>🏥 ER Dashboard</h1>
                <Link to="/hospital/profile">
                    <button style={{ padding: '0.8rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Manage Resources
                    </button>
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ flex: 1, background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
                    <h2 style={{ marginTop: 0 }}>🚨 Incoming ({incomingTrips.length})</h2>
                    
                    {incomingTrips.length === 0 && <p style={{ color: '#666' }}>No ambulances currently en route.</p>}

                    {incomingTrips.map(trip => (
                        <div key={trip.id} style={{ 
                            background: 'white', padding: '1rem', marginBottom: '1rem', 
                            borderLeft: `5px solid ${trip.medicalReport?.severity === 'CRITICAL' ? 'red' : 'orange'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ margin: 0 }}>{trip.medicalReport?.suspectedCondition || 'Emergency'}</h3>
                                <span style={{ fontWeight: 'bold', color: 'red', fontSize: '0.9rem' }}>{trip.status.replace('_', ' ')}</span>
                            </div>
                            <p style={{ margin: '0.5rem 0', color: '#666' }}>Vehicle: {trip.driver?.ambulance?.plateNumber}</p>
                            
                            <Link to={`/hospital/patient/${trip.id}`}>
                                <button style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                                    View Live Tracking & Vitals
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     );
}
export default HospitalDashboard;