import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { socket } from '../../utils/socket';
import MapComponent from '../../components/MapComponent';

export interface IncomingPatientDetailProps {}
 
const IncomingPatientDetail: React.FC<IncomingPatientDetailProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/hospitals/trip/${tripId}`);
                setTrip(res.data);
                if (res.data.driver?.currentLat) {
                    setDriverLocation([res.data.driver.currentLat, res.data.driver.currentLng]);
                }
            } catch (err) { 
                console.error(err); 
                navigate('/hospital/dashboard');
            }
        };
        fetchTrip();
    }, [tripId, navigate]);

    // Listen to live telemetry!
    useEffect(() => {
        if (!tripId) return;
        socket.connect();
        socket.emit("joinTrip", tripId); // Join the same room as the driver and patient

        socket.on("driverLocationUpdated", (data: { lat: number; lng: number }) => {
            setDriverLocation([data.lat, data.lng]);
        });

        socket.on("tripStatusChanged", (data: any) => {
            if (data.status === "COMPLETED") {
                alert("Patient Handover Complete. Returning to dashboard.");
                navigate('/hospital/dashboard');
            }
        });

        return () => {
          socket.off("driverLocationUpdated");
          socket.off("tripStatusChanged");
        };
    }, [tripId, navigate]);

    if (!trip) return <div style={{ padding: '2rem' }}>Loading patient data...</div>;

    const hospitalLocation: [number, number] = [trip.destLat, trip.destLng];
    const mapCenter = driverLocation || hospitalLocation;

    return ( 
        <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button onClick={() => navigate('/hospital/dashboard')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>&larr; Back to Dashboard</button>
                
                <div style={{ background: '#ffebee', padding: '1.5rem', borderRadius: '8px', border: '1px solid red' }}>
                    <h1 style={{ color: '#c62828', margin: '0 0 0.5rem 0' }}>{trip.medicalReport?.severity}: {trip.medicalReport?.suspectedCondition || 'Emergency'}</h1>
                    <p style={{ margin: '0 0 0.3rem 0' }}><strong>Patient:</strong> {trip.passenger.fullName} (Blood: {trip.passenger.bloodType || 'Unknown'})</p>
                    <p style={{ margin: 0 }}><strong>Ambulance:</strong> {trip.driver?.ambulance?.plateNumber} ({trip.driver?.ambulance?.type})</p>
                </div>

                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3 style={{ marginTop: 0 }}>🩺 Vitals & Notes</h3>
                    <p><strong>BP:</strong> {trip.medicalReport?.vitalsCheck?.bp || 'Pending'}</p>
                    <p><strong>Pulse:</strong> {trip.medicalReport?.vitalsCheck?.pulse || 'Pending'}</p>
                    <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />
                    <p><strong>Paramedic Notes:</strong> {trip.medicalReport?.paramedicNotes || 'None provided.'}</p>
                    <p><strong>Allergies:</strong> {trip.passenger.allergies || 'None recorded'}</p>
                </div>
            </div>

            <div style={{ flex: 1.5, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <MapComponent 
                    center={mapCenter} 
                    zoom={15} 
                    markers={[
                        { position: hospitalLocation, label: `🏥 ${trip.destAddress}` },
                        ...(driverLocation ? [{ position: driverLocation, label: '🚑 Ambulance (Live)' }] : [])
                    ]} 
                />
            </div>
        </div>
     );
}
export default IncomingPatientDetail;