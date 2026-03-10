import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../utils/socket';
import { useAuthStore } from '../../store/useAuthStore';
import MapComponent from '../../components/MapComponent'; // Ensure the path is correct for your structure
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
    
    // Map State
    const [driverLocation, setDriverLocation] = useState<[number, number]>([19.1973, 72.9644]);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch driver's live location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setDriverLocation([position.coords.latitude, position.coords.longitude]),
                (error) => console.error("Error getting driver location:", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Socket Logic
    useEffect(() => {
        if (!tripId) return;

        socket.connect();
        
        socket.emit('joinTrip', tripId);

        socket.on('receiveChat', (data: ChatMessage) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receiveChat');
        };
    }, [tripId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatOpen]);

    // Add this right before your socket useEffect
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!tripId) return;
            try {
                // Fetch previous messages from DB
                const response = await api.get(`/users/trip/${tripId}/chat`);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };
        fetchChatHistory();
    }, [tripId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user || !tripId) return;

        socket.emit('sendChat', {
            tripId,
            senderName: user.fullName,
            senderId: user.id,
            message: inputText.trim()
        });

        setInputText('');
    };

    const handleStatusChange = async () => {
        try {
            if (status === 'TO_PICKUP') {
                // 1. Update Database
                await api.post(`/trips/${tripId}/arrive-to-patient`);
                
                // 2. Alert Patient via Socket
                socket.emit('updateTripStatus', {
                    tripId,
                    status: 'ARRIVED',
                    message: 'Ambulance has arrived at your location!'
                });
                
                setStatus('TO_HOSPITAL');
            } else {
                // 1. Update Database
                await api.post(`/trips/${tripId}/arrive-at-hospital`);
                
                // 2. Alert Patient via Socket
                socket.emit('updateTripStatus', {
                    tripId,
                    status: 'AT_HOSPITAL',
                    message: 'Arrived at the hospital. Handover in progress.'
                });
                
                navigate(`/driver/handover/${tripId}`);
            }
        } catch (error) {
            console.error("Failed to update trip status", error);
        }
    };

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
                    zoom={15} 
                    markers={[{ 
                        position: driverLocation, 
                        label: status === 'TO_PICKUP' ? 'Ambulance (You)' : 'Heading to Hospital' 
                    }]} 
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