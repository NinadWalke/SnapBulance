import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export interface DriverTripDetailProps {}

const DriverTripDetail: React.FC<DriverTripDetailProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                const response = await api.get(`/trips/driver/trip/${tripId}`);
                setTrip(response.data);
            } catch (error) {
                console.error("Failed to load trip details", error);
                alert("Could not load mission details.");
                navigate('/driver/trips');
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
                onClick={() => navigate('/driver/trips')}
                style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
            >
                &larr; Back to Missions
            </button>
            
            <h1 style={{ marginBottom: '0.5rem' }}>Mission Details</h1>
            <p style={{ color: '#666', marginTop: 0 }}>ID: {trip.id}</p>

            {/* General Overview */}
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '1.5rem' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Overview</h3>
                <p><strong>Status:</strong> {trip.status}</p>
                <p><strong>Dispatched:</strong> {reqDate}</p>
                <p><strong>Completed:</strong> {compDate}</p>
                <p><strong>Pickup:</strong> {trip.pickupAddress}</p>
                <p><strong>Destination:</strong> {trip.hospital?.name || trip.destAddress || 'N/A'}</p>
            </div>

            {/* Patient Information */}
            <div style={{ background: '#eef6fc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #b6d4fe', marginTop: '1rem' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #b6d4fe', paddingBottom: '0.5rem', color: '#004085' }}>Patient Info</h3>
                <p><strong>Name:</strong> {trip.passenger.fullName}</p>
                <p><strong>Phone:</strong> {trip.passenger.phone}</p>
                <p><strong>Blood Type:</strong> {trip.passenger.bloodType || 'Not Provided'}</p>
                <p><strong>Allergies:</strong> {trip.passenger.allergies || 'None noted'}</p>
            </div>

            {/* Medical Report */}
            {trip.medicalReport && (
                <div style={{ background: '#fdf3e5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f9cca4', marginTop: '1rem' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #f9cca4', paddingBottom: '0.5rem', color: '#856404' }}>Medical Report Filed</h3>
                    <p><strong>Severity:</strong> {trip.medicalReport.severity}</p>
                    <p><strong>Condition:</strong> {trip.medicalReport.suspectedCondition || 'None noted'}</p>
                    {trip.medicalReport.vitalsCheck && (
                        <p><strong>Vitals:</strong> BP {trip.medicalReport.vitalsCheck.bp || 'N/A'} | Pulse {trip.medicalReport.vitalsCheck.pulse || 'N/A'}</p>
                    )}
                    <p><strong>Paramedic Notes:</strong> {trip.medicalReport.paramedicNotes || 'N/A'}</p>
                </div>
            )}
        </div>
    );
}

export default DriverTripDetail;