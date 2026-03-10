import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../utils/api';

export interface MissionSummaryProps {}
 
const MissionSummary: React.FC<MissionSummaryProps> = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTripSummary = async () => {
            if (!tripId) return;
            try {
                const response = await api.get(`/trips/driver/trip/${tripId}`);
                setTrip(response.data);
            } catch (error) {
                console.error("Failed to load mission summary", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTripSummary();
    }, [tripId]);

    if (loading) return <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading summary...</div>;
    if (!trip) return <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>Trip data not found.</div>;

    // Optional: Calculate dummy earnings based on distance if it exists in DB, otherwise default to 450
    const earnings = trip.distanceKm ? Math.round(trip.distanceKm * 50 + 100) : 450;

    return ( 
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1>Mission Complete</h1>
            <p>Great job! The hospital received the patient data successfully.</p>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Handed over <strong>{trip.passenger.fullName}</strong> to <strong>{trip.hospital?.name || 'Destination'}</strong>.
            </p>
            
            <div style={{ margin: '2rem auto', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', maxWidth: '300px' }}>
                <h3 style={{ margin: '0' }}>Trip Earnings</h3>
                <h1 style={{ color: 'green', margin: '0.5rem 0' }}>₹{earnings}</h1>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
                <Link to={`/driver/trips/${tripId}`}>
                    <button style={{ padding: '1rem 2rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        View Mission Details
                    </button>
                </Link>
                
                <Link to="/driver/dashboard">
                    <button style={{ padding: '1rem 2rem', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        Back to Dashboard
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default MissionSummary;