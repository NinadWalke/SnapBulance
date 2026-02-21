import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../../../components/MapComponent';

export interface UserHomeProps {}
 
const UserHome: React.FC<UserHomeProps> = () => {
    // Initial fallback location
    const [location, setLocation] = useState<[number, number]>([19.1973, 72.9644]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

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

    return ( 
        <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>User Home</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                {isLoadingLocation ? 'Locating you...' : 'Live Location Secured'}
            </p>
            
            {/* Map Area */}
            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                <MapComponent center={location} markers={[{ position: location, label: 'Your Current Location' }]} />
            </div>
            
            <div style={{ marginTop: '2rem', border: '1px dashed #ccc', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Emergency Assistance Needed?</h3>
                <p style={{ color: '#555' }}>Tap the button below to find the nearest ambulance.</p>
                
                <Link to="/user/searching" style={{ textDecoration: 'none' }}>
                    <button style={{ 
                        marginTop: '1rem', 
                        padding: '1rem 2rem', 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        backgroundColor: '#d32f2f', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        🚨 BOOK AMBULANCE
                    </button>
                </Link>
            </div>
        </div>
     );
}
 
export default UserHome;