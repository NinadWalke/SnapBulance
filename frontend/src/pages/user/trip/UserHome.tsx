import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from Link to useNavigate
import MapComponent from '../../../components/MapComponent';
import { api } from '../../../utils/api'; // Import your API instance

export interface UserHomeProps {}
 
const UserHome: React.FC<UserHomeProps> = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState<[number, number]>([19.1973, 72.9644]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [isBooking, setIsBooking] = useState(false); // New state for button loading

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation([position.coords.latitude, position.coords.longitude]);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    setIsLoadingLocation(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLoadingLocation(false);
        }
    }, []);

    // Add inside UserHome component
    useEffect(() => {
        const checkActiveTrip = async () => {
            try {
                const response = await api.get('/users/active-trip');
                if (response.data) {
                    const activeTrip = response.data;
                    // Route based on state
                    if (activeTrip.status === 'SEARCHING') {
                        navigate(`/user/searching/${activeTrip.id}`);
                    } else {
                        navigate(`/user/track/${activeTrip.id}`);
                    }
                }
            } catch (error) {
                console.error("Failed to check active trip", error);
            }
        };
        checkActiveTrip();
    }, [navigate]);

    // Socket setup omitted for brevity, keep your existing socket code here!

    // NEW: Handle the actual booking creation
    const handleBookAmbulance = async () => {
        setIsBooking(true);
        try {
            // Send the user's current coordinates to the backend
            const response = await api.post('/users/book-trip', {
                lat: location[0],
                lng: location[1]
            });
            
            // response.data will contain the new trip object with the UUID
            const newTripId = response.data.id;
            
            // Navigate dynamically to the searching page with the new ID
            navigate(`/user/searching/${newTripId}`);
        } catch (error) {
            console.error("Error booking trip:", error);
            alert("Failed to book ambulance. Please try again.");
            setIsBooking(false);
        }
    };

    return ( 
        <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>User Home</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                {isLoadingLocation ? 'Locating you...' : 'Live Location Secured'}
            </p>
            
            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                <MapComponent center={location} markers={[{ position: location, label: 'Your Current Location' }]} />
            </div>
            
            <div style={{ marginTop: '2rem', border: '1px dashed #ccc', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Emergency Assistance Needed?</h3>
                <p style={{ color: '#555' }}>Tap the button below to find the nearest ambulance.</p>
                
                {/* Replaced Link with onClick handler */}
                <button 
                    onClick={handleBookAmbulance}
                    disabled={isBooking || isLoadingLocation}
                    style={{ 
                        marginTop: '1rem', 
                        padding: '1rem 2rem', 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        backgroundColor: isBooking || isLoadingLocation ? '#ff9999' : '#d32f2f', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        cursor: isBooking || isLoadingLocation ? 'not-allowed' : 'pointer',
                        width: '100%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                    {isBooking ? 'CREATING TRIP...' : '🚨 BOOK AMBULANCE'}
                </button>
            </div>
        </div>
     );
}
 
export default UserHome;