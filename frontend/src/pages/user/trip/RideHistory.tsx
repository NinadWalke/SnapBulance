import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api'; // Adjust path if needed

export interface RideHistoryProps {}

// Define the shape based on our backend response
interface TripSummary {
    id: string;
    requestedAt: string;
    pickupAddress: string;
    destAddress: string | null;
    status: string;
    hospital?: { name: string } | null;
}
 
const RideHistory: React.FC<RideHistoryProps> = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<TripSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/users/trips/history');
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading history...</div>;

    return ( 
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Ride History</h1>
            {history.length === 0 ? (
                <p>No trips found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '0.8rem' }}>Date</th>
                            <th style={{ padding: '0.8rem' }}>Destination</th>
                            <th style={{ padding: '0.8rem' }}>Status</th>
                            <th style={{ padding: '0.8rem', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((ride) => {
                            // Format date cleanly
                            const dateObj = new Date(ride.requestedAt);
                            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            // Determine destination text
                            const destText = ride.hospital?.name || ride.destAddress || 'Not specified';

                            return (
                                <tr 
                                    key={ride.id} 
                                    style={{ borderBottom: '1px solid #ddd', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.8rem' }}>{formattedDate}</td>
                                    <td style={{ padding: '0.8rem' }}>{destText}</td>
                                    <td style={{ 
                                        padding: '0.8rem', 
                                        fontWeight: 'bold',
                                        color: ride.status === 'CANCELLED' ? '#d32f2f' : 
                                               ride.status === 'COMPLETED' ? '#2e7d32' : '#ed6c02' 
                                    }}>
                                        {ride.status.replace('_', ' ')}
                                    </td>
                                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => navigate(`/user/history/${ride.id}`)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#0056b3'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
     );
}
 
export default RideHistory;