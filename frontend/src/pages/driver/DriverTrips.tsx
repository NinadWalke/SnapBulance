import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Added import
import { api } from '../../utils/api'; 

export interface DriverTripsProps {}

interface DriverTripSummary {
    id: string;
    requestedAt: string;
    pickupAddress: string;
    destAddress: string | null;
    status: string;
    hospital?: { name: string } | null;
    passenger: { fullName: string; phone: string };
}
 
const DriverTrips: React.FC<DriverTripsProps> = () => {
    const navigate = useNavigate(); // <-- Added hook
    const [trips, setTrips] = useState<DriverTripSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await api.get('/trips/driver/history');
                setTrips(response.data);
            } catch (error) {
                console.error("Failed to load driver trips", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading your trips...</div>;

    return ( 
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>My Missions</h1>
            <p style={{ color: '#666', marginTop: '-10px', marginBottom: '2rem' }}>A history of your ambulance dispatches.</p>
            
            {trips.length === 0 ? (
                <p>No missions recorded yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trips.map((trip) => {
                        const dateObj = new Date(trip.requestedAt);
                        const formattedDate = dateObj.toLocaleDateString() + ' • ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const destText = trip.hospital?.name || trip.destAddress || 'Not specified';
                        const badgeColor = trip.status === 'COMPLETED' ? '#2e7d32' : trip.status === 'CANCELLED' ? '#d32f2f' : '#ed6c02';

                        return (
                            <div key={trip.id} style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: '1.5rem', 
                                background: '#fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#333' }}>{formattedDate}</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#888' }}>Trip ID: {trip.id}</p>
                                    </div>
                                    <span style={{ 
                                        background: badgeColor, 
                                        color: 'white', 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {trip.status.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#666' }}><strong>Patient:</strong></p>
                                        <p style={{ margin: 0 }}>{trip.passenger.fullName} ({trip.passenger.phone})</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#666' }}><strong>Route:</strong></p>
                                        <p style={{ margin: 0 }}>📍 {trip.pickupAddress}</p>
                                        <p style={{ margin: '4px 0 0 0' }}>🏥 {destText}</p>
                                    </div>
                                </div>

                                {/* NEW: View Details Button */}
                                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => navigate(`/driver/trips/${trip.id}`)}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            background: '#333',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        View Mission Details
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
     );
}
 
export default DriverTrips;