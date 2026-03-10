import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';

export interface RideDetailProps {}

const RideDetail: React.FC<RideDetailProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                const response = await api.get(`/users/trip/${tripId}`);
                setTrip(response.data);
            } catch (error) {
                console.error("Failed to load trip details", error);
                alert("Could not load trip details.");
                navigate('/user/history'); // Go back on error
            } finally {
                setLoading(false);
            }
        };
        fetchTripDetails();
    }, [tripId, navigate]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading details...</div>;
    if (!trip) return null;

    const reqDate = new Date(trip.requestedAt).toLocaleString();
    const compDate = trip.completedAt ? new Date(trip.completedAt).toLocaleString() : 'N/A';

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/user/history')}
                style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
            >
                &larr; Back to History
            </button>
            
            <h1 style={{ marginBottom: '0.5rem' }}>Trip Details</h1>
            <p style={{ color: '#666', marginTop: 0 }}>ID: {trip.id}</p>

            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1.5rem' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Overview</h3>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Requested:</strong> {reqDate}</p>
                <p><strong>Completed:</strong> {compDate}</p>
                <p><strong>Pickup:</strong> {trip.pickupAddress}</p>
                <p><strong>Destination:</strong> {trip.hospital?.name || trip.destAddress || 'N/A'}</p>
            </div>

            {trip.driver && (
                <div style={{ background: '#eef6fc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #b6d4fe', marginTop: '1rem' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #b6d4fe', paddingBottom: '0.5rem', color: '#004085' }}>Responder / Ambulance Info</h3>
                    <p><strong>Driver:</strong> {trip.driver.user.fullName}</p>
                    <p><strong>Ambulance Plate:</strong> {trip.driver.ambulance?.plateNumber || 'N/A'}</p>
                    <p><strong>Type:</strong> {trip.driver.ambulance?.type || 'N/A'}</p>
                </div>
            )}

            {trip.medicalReport && (
                <div style={{ background: '#fdf3e5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f9cca4', marginTop: '1rem' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #f9cca4', paddingBottom: '0.5rem', color: '#856404' }}>Medical Report</h3>
                    <p><strong>Severity:</strong> {trip.medicalReport.severity}</p>
                    <p><strong>Suspected Condition:</strong> {trip.medicalReport.suspectedCondition || 'None noted'}</p>
                    <p><strong>Paramedic Notes:</strong> {trip.medicalReport.paramedicNotes || 'N/A'}</p>
                </div>
            )}
        </div>
    );
}

export default RideDetail;