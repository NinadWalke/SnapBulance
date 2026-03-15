import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from Link to useNavigate
import MapComponent from '../../../components/MapComponent';
import { api } from '../../../utils/api'; // Import your API instance
import './UserHome.css';

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
    <div className="sb-home">
        <div className="sb-home__card">
 
            {/* ── Header ── */}
            <header className="sb-home__header">
                <span className="sb-home__eyebrow">
                    <span className="sb-home__eyebrow-dot" aria-hidden="true" />
                    Emergency Dispatch
                </span>
                <h1 className="sb-home__title">Request Help,<br />Right Now.</h1>
                <p className="sb-home__subtitle">Nearest ambulance dispatched to your live location.</p>
            </header>
 
            {/* ── Location Status Bar ── */}
            <div className={`sb-home__location-bar${isLoadingLocation ? ' sb-home__location-bar--loading' : ''}`}>
                <span className="sb-home__location-icon" aria-hidden="true">
                    {isLoadingLocation ? '📡' : '📍'}
                </span>
                <span className={`sb-home__location-text${isLoadingLocation ? ' sb-home__location-text--loading' : ''}`}>
                    {isLoadingLocation ? 'Acquiring GPS signal...' : 'Live location secured'}
                </span>
                {isLoadingLocation ? (
                    <div className="sb-home__location-scanner" aria-hidden="true">
                        <span /><span /><span /><span />
                    </div>
                ) : (
                    <div className="sb-home__location-check" aria-label="Location confirmed">✓</div>
                )}
            </div>
 
            {/* ── Map ── */}
            <div className="sb-home__map-wrapper">
                {/* HUD corner brackets */}
                <div className="sb-home__map-corner sb-home__map-corner--tl" aria-hidden="true" />
                <div className="sb-home__map-corner sb-home__map-corner--tr" aria-hidden="true" />
                <div className="sb-home__map-corner sb-home__map-corner--bl" aria-hidden="true" />
                <div className="sb-home__map-corner sb-home__map-corner--br" aria-hidden="true" />
 
                <MapComponent
                    center={location}
                    markers={[{ position: location, label: 'Your Current Location' }]}
                />
 
                {/* Coordinate readout */}
                {!isLoadingLocation && (
                    <div className="sb-home__map-coords" aria-live="polite">
                        {location[0].toFixed(4)}°N &nbsp;/&nbsp; {location[1].toFixed(4)}°E
                    </div>
                )}
            </div>
 
            {/* ── CTA Panel ── */}
            <div className="sb-home__cta-panel">
                <p className="sb-home__cta-label">Emergency Assistance Needed?</p>
                <p className="sb-home__cta-sublabel">
                    Tap below to dispatch the nearest available ambulance to your location.
                </p>
 
                <button
                    className="sb-book-btn"
                    onClick={handleBookAmbulance}
                    disabled={isBooking || isLoadingLocation}
                    aria-busy={isBooking}
                    aria-label={isBooking ? 'Creating trip, please wait' : 'Book an ambulance now'}
                >
                    {isBooking ? (
                        <>
                            <div className="sb-book-btn__spinner" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                            <span className="sb-book-btn__text">DISPATCHING...</span>
                        </>
                    ) : (
                        <>
                            <span className="sb-book-btn__icon" aria-hidden="true">🚨</span>
                            <span className="sb-book-btn__text">BOOK AMBULANCE NOW</span>
                        </>
                    )}
                </button>
 
                <p className="sb-home__disclaimer" aria-label="Emergency use only">
                    <span aria-hidden="true">⚠</span>
                    For genuine emergencies only. Misuse is a punishable offence.
                </p>
            </div>
 
        </div>
    </div>
);
}
 
export default UserHome;