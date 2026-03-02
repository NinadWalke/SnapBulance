import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import MapComponent from '../../../components/MapComponent';
import { useAuthStore } from '../../../store/useAuthStore';
import { socket } from '../../../utils/socket';
import { api } from '../../../utils/api';

export interface LiveTripTrackingProps {}

 interface ChatMessage {
    senderName: string;
    senderId: string;
    message: string;
    timestamp: string;
}

const LiveTripTracking: React.FC<LiveTripTrackingProps> = () => {
    const { tripId } = useParams();
    const {user} = useAuthStore();
    const [userLocation, setUserLocation] = useState<[number, number]>([19.1973, 72.9644]);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch location again (or grab it from a global state/context later)
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Socket Logic
    useEffect(() => {
        if (!tripId) return;

        socket.connect();

        // Join the specific trip room
        socket.emit('joinTrip', tripId);

        // Listen for incoming messages
        socket.on('receiveChat', (data: ChatMessage) => {
            setMessages((prev) => [...prev, data]);
        });

        // Cleanup
        return () => {
            socket.off('receiveChat');
            // We won't disconnect the entire socket here, just remove the listener
        };
    }, [tripId]);

    // Auto-scroll chat to bottom
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

        setInputText(''); // Clear input
    };

    return ( 
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto', border: '1px solid #ddd', position: 'relative' }}>
            
            {/* Map Area */}
            <div style={{ flex: 2, position: 'relative', display: isChatOpen ? 'none' : 'block' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Trip ID: {tripId}
                </div>
                <MapComponent center={userLocation} zoom={15} markers={[{ position: userLocation, label: 'Pickup Point' }]} />
            </div>

            {/* Chat Area (Overlays Map when open) */}
            {isChatOpen && (
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
                    <div style={{ padding: '1rem', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Driver Chat</h3>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                    </div>
                    
                    {/* Message List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {messages.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No messages yet. Say hello!</p>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                                            {msg.senderName}
                                        </div>
                                        <div style={{ 
                                            padding: '0.8rem', 
                                            borderRadius: '12px', 
                                            background: isMe ? '#d32f2f' : '#e0e0e0', 
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

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #ddd', display: 'flex', gap: '0.5rem' }}>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Message driver..." 
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                        />
                        <button type="submit" style={{ padding: '0 1.2rem', background: '#333', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* Bottom Sheet / Driver Info */}
            <div style={{ flex: 1, padding: '1.5rem', background: 'white', borderTop: '1px solid #ccc', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.2rem 0', color: '#333' }}>Arriving in 5 mins</h2>
                        <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>Ambulance is En Route</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', background: '#f5f5f5', padding: '0.3rem 0.6rem', border: '1px solid #ddd', borderRadius: '4px', display: 'inline-block' }}>MH-04-AB-1234</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Mercedes Sprinter (ALS)</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Toggle Chat Button */}
                    <button 
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        style={{ flex: 1, padding: '1rem', background: isChatOpen ? '#ddd' : '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
                    >
                        {isChatOpen ? '🗺️ View Map' : '💬 Chat with Driver'}
                    </button>
                    <button style={{ flex: 1, padding: '1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        📍 Share Status
                    </button>
                </div>
            </div>
        </div>
     );
}
 
export default LiveTripTracking;