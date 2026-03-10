import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../utils/socket';
import { useAuthStore } from '../../store/useAuthStore';
import MapComponent from '../../components/MapComponent';
import { api } from '../../utils/api';

export interface ActiveNavigationProps {}

interface ChatMessage {
    senderName: string;
    senderId: string;
    message: string;
    timestamp: string;
}
 
const ActiveNavigation: React.FC<ActiveNavigationProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const [status, setStatus] = useState<'TO_PICKUP' | 'TO_HOSPITAL'>('TO_PICKUP');
    
    // Map & Routing State
    const [driverLocation, setDriverLocation] = useState<[number, number]>([19.1973, 72.9644]); // Default fallback
    const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
    const [targetLabel, setTargetLabel] = useState('📍 Patient');
    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Trip Data to get Patient Location
    useEffect(() => {
        const fetchTrip = async () => {
            if (!tripId) return;
            try {
                // Ensure your backend returns pickupLat and pickupLng here
                const response = await api.get(`/trips/driver/trip/${tripId}`);
                setPatientLocation([response.data.pickupLat, response.data.pickupLng]);
                
                // If driver has a saved location, set it
                if (response.data.driver?.currentLat) {
                    setDriverLocation([response.data.driver.currentLat, response.data.driver.currentLng]);
                }
            } catch (error) {
                console.error("Error fetching trip details:", error);
            }
        };
        fetchTrip();
    }, [tripId]);

    // 2. Fetch Route from OSRM
    useEffect(() => {
        const fetchRoute = async () => {
            if (!patientLocation) return;
            
            try {
                // OSRM requires coordinates in [longitude, latitude] format
                const url = `https://router.project-osrm.org/route/v1/driving/${driverLocation[1]},${driverLocation[0]};${patientLocation[1]},${patientLocation[0]}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.routes && data.routes.length > 0) {
                    // Map back to [latitude, longitude] for our map component
                    const coords = data.routes[0].geometry.coordinates.map((c: any[]) => [c[1], c[0]]);
                    setRouteCoords(coords);
                }
            } catch (error) {
                console.error("Failed to fetch route", error);
            }
        };

        if (routeCoords.length === 0) {
            fetchRoute();
        }
    }, [driverLocation, patientLocation, routeCoords.length]);

    // 3. Telemetry Simulation Engine
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        
        if (routeCoords.length > 0 && status === 'TO_PICKUP') {
            let step = 0;
            
            timer = setInterval(() => {
                if (step < routeCoords.length) {
                    const newLocation = routeCoords[step];
                    setDriverLocation(newLocation); // Move on local map
                    
                    // Fire socket event to move it on patient's map
                    socket.emit('driverLocationUpdate', {
                        tripId,
                        lat: newLocation[0],
                        lng: newLocation[1]
                    });
                    
                    step++;
                } else {
                    clearInterval(timer); // Reached destination
                }
            }, 1000); // Ambulance moves every 1 second for testing
        }

        return () => clearInterval(timer);
    }, [routeCoords, status, tripId]);

    // Socket Setup
    useEffect(() => {
        if (!tripId) return;
        socket.connect();
        socket.emit('joinTrip', tripId);
        socket.on('receiveChat', (data: ChatMessage) => setMessages((prev) => [...prev, data]));
        return () => { socket.off('receiveChat'); };
    }, [tripId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user || !tripId) return;
        socket.emit('sendChat', { tripId, senderName: user.fullName, senderId: user.id, message: inputText.trim() });
        setInputText('');
    };

    const handleStatusChange = async () => {
        try {
            if (status === 'TO_PICKUP') {
                // 1. Alert Backend. It calculates closest hospital.
                const res = await api.post(`/trips/${tripId}/arrive-to-patient`);
                const updatedTrip = res.data.updatedTrip;
                
                // 2. Set new target to Hospital
                setTargetLocation([updatedTrip.destLat, updatedTrip.destLng]);
                setTargetLabel(`🏥 ${updatedTrip.hospital.name}`);
                setStatus('TO_HOSPITAL');
                setRouteCoords([]); // Clear route to trigger OSRM recalculation
                
                // 3. Alert Patient via Socket with NEW DESTINATION
                socket.emit('updateTripStatus', {
                    tripId,
                    status: 'ARRIVED',
                    message: `Heading to ${updatedTrip.hospital.name}`,
                    destLat: updatedTrip.destLat,
                    destLng: updatedTrip.destLng
                });
            } else {
                await api.post(`/trips/${tripId}/arrive-at-hospital`);
                socket.emit('updateTripStatus', { tripId, status: 'AT_HOSPITAL', message: 'Arrived at the hospital.' });
                navigate(`/driver/handover/${tripId}`);
            }
        } catch (error) {
            console.error("Failed to update trip status", error);
        }
    };

    // Construct markers safely
    // Update markers array for MapComponent
    const markers = [];
    markers.push({ position: driverLocation, label: '🚑 You' });
    if (targetLocation) markers.push({ position: targetLocation, label: targetLabel });
    return ( 
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto', border: '1px solid #ddd' }}>
            
            {/* Map Area */}
            <div style={{ flex: 2, position: 'relative', display: isChatOpen ? 'none' : 'block' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Trip ID: {tripId}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                        Route to: {status === 'TO_PICKUP' ? 'Patient Location' : 'City Hospital'}
                    </div>
                </div>
                
                <MapComponent 
                    center={driverLocation} 
                    zoom={14} 
                    markers={markers} 
                    polyline={routeCoords} 
                />
            </div>

            {/* Chat Area (Overlays Map when open) */}
            {isChatOpen && (
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
                    <div style={{ padding: '1rem', background: '#d32f2f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Patient Chat</h3>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {messages.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>Contact patient if needed.</p>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                                            {msg.senderName}
                                        </div>
                                        <div style={{ 
                                            padding: '0.8rem', borderRadius: '12px', 
                                            background: isMe ? '#333' : '#e0e0e0', // Driver messages are dark grey
                                            color: isMe ? 'white' : 'black',
                                            borderBottomRightRadius: isMe ? '2px' : '12px',
                                            borderBottomLeftRadius: isMe ? '12px' : '2px'
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #ddd', display: 'flex', gap: '0.5rem' }}>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Message patient..." 
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                        />
                        <button type="submit" style={{ padding: '0 1.2rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* Bottom Sheet / Controls */}
            <div style={{ flex: 1, padding: '1.5rem', background: '#f8f9fa', borderTop: '2px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#333' }}>
                        {status === 'TO_PICKUP' ? '➡️ Head to Pickup' : '🏥 Rush to Hospital'}
                    </h2>
                    <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', color: '#555' }}>
                        Turn right in 200m
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        style={{ flex: 1, padding: '1rem', background: isChatOpen ? '#ddd' : '#fff', border: '2px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isChatOpen ? '🗺️ View Map' : '💬 Chat Patient'}
                    </button>
                    
                    <button 
                        onClick={handleStatusChange}
                        style={{ flex: 2, padding: '1rem', background: status === 'TO_PICKUP' ? '#007bff' : '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {status === 'TO_PICKUP' ? 'ARRIVED AT PATIENT' : 'ARRIVED AT HOSPITAL'}
                    </button>
                </div>
            </div>
        </div>
     );
}
 
export default ActiveNavigation;