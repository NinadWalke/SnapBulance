import * as React from 'react';
import { Link } from 'react-router-dom';

export interface HospitalDashboardProps {}
 
const HospitalDashboard: React.FC<HospitalDashboardProps> = () => {
    // Mock Data: Incoming Ambulances
    const incomingTrips = [
        { id: 'trip_123', eta: '5 mins', severity: 'CRITICAL', type: 'Cardiac Arrest', ambulance: 'MH-04-AB-1234' },
        { id: 'trip_456', eta: '12 mins', severity: 'MODERATE', type: 'Fracture', ambulance: 'MH-12-CD-5678' },
    ];

    return ( 
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>🏥 ER Dashboard</h1>
                <Link to="/hospital/profile">
                    <button style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none' }}>
                        Update Resources
                    </button>
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                {/* Column 1: Incoming */}
                <div style={{ flex: 1, background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                    <h2>🚨 Incoming ({incomingTrips.length})</h2>
                    
                    {incomingTrips.map(trip => (
                        <div key={trip.id} style={{ 
                            background: 'white', padding: '1rem', marginBottom: '1rem', 
                            borderLeft: `5px solid ${trip.severity === 'CRITICAL' ? 'red' : 'orange'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ margin: 0 }}>{trip.type}</h3>
                                <span style={{ fontWeight: 'bold', color: 'red' }}>ETA: {trip.eta}</span>
                            </div>
                            <p style={{ margin: '0.5rem 0', color: '#666' }}>Vehicle: {trip.ambulance}</p>
                            
                            <Link to={`/hospital/patient/${trip.id}`}>
                                <button style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                                    View Patient Vitals
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Column 2: Arrived / Handover */}
                <div style={{ flex: 1, background: '#eef6fc', padding: '1rem', borderRadius: '8px' }}>
                    <h2>✅ Arrived / Triage</h2>
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No pending handovers.</p>
                </div>
            </div>
        </div>
     );
}
 
export default HospitalDashboard;