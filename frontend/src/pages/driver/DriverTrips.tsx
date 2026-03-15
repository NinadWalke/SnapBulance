import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Added import
import { api } from '../../utils/api'; 

import './DriverTrips.css'

export interface DriverTripsProps {}

interface DriverTripSummary {
    id: string;
    requestedAt: string;
    pickupAddress: string;
    destAddress: string | null;
    status: string;
    hospital?: { name: string } | null;
    passenger: { fullName: string; phone: string };
}
 
const DriverTrips: React.FC<DriverTripsProps> = () => {
    const navigate = useNavigate(); // <-- Added hook
    const [trips, setTrips] = useState<DriverTripSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await api.get('/trips/driver/history');
                setTrips(response.data);
            } catch (error) {
                console.error("Failed to load driver trips", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const getStatusVariant = (status: string): string => {
    switch (status) {
        case 'COMPLETED':  return 'completed';
        case 'CANCELLED':  return 'cancelled';
        case 'IN_PROGRESS':
        case 'SEARCHING':
        case 'DRIVER_ASSIGNED': return 'in-progress';
        default: return 'default';
    }
};
 
// Loading guard
if (loading) {
    return (
        <div className="sb-dtrips__loading">
            <div className="sb-dtrips__loading-inner">
                <div className="sb-dtrips__loading-spinner" aria-hidden="true" />
                <span className="sb-dtrips__loading-text">Loading Missions</span>
            </div>
        </div>
    );
}
 
return (
    <div className="sb-dtrips">
        <div className="sb-dtrips__card">
 
            {/* ── Page Header ── */}
            <header className="sb-dtrips__header">
                <div className="sb-dtrips__header-left">
                    <span className="sb-dtrips__eyebrow">🚑 Dispatch Log</span>
                    <h1 className="sb-dtrips__title">My Missions</h1>
                    <p className="sb-dtrips__subtitle">A history of your ambulance dispatches.</p>
                </div>
 
                {trips.length > 0 && (
                    <div className="sb-dtrips__count-badge">
                        <strong>{trips.length}</strong>
                        {trips.length === 1 ? 'mission' : 'missions'} completed
                    </div>
                )}
            </header>
 
            {/* ── Empty State ── */}
            {trips.length === 0 ? (
                <div className="sb-dtrips__empty" role="status">
                    <span className="sb-dtrips__empty-icon" aria-hidden="true">🛣️</span>
                    <h2 className="sb-dtrips__empty-title">No missions yet</h2>
                    <p className="sb-dtrips__empty-sub">
                        Your completed dispatches will appear here once you accept your first ride.
                    </p>
                </div>
            ) : (
                <div className="sb-dtrips__feed" role="list" aria-label="Mission history">
                    {trips.map((trip) => {
                        const dateObj      = new Date(trip.requestedAt);
                        const formattedDate = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                            + ' · '
                                            + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const destText     = trip.hospital?.name || trip.destAddress;
                        const statusVariant = getStatusVariant(trip.status);
 
                        return (
                            <article key={trip.id} className="sb-dtrips__mission" role="listitem">
 
                                {/* Top: date + status */}
                                <div className="sb-dtrips__mission-top">
                                    <div className="sb-dtrips__mission-meta">
                                        <span className="sb-dtrips__mission-date">{formattedDate}</span>
                                        <span className="sb-dtrips__mission-id" title="Trip ID"># {trip.id}</span>
                                    </div>
                                    <span className={`sb-status-badge sb-status-badge--${statusVariant}`}>
                                        <span className="sb-status-badge__dot" aria-hidden="true" />
                                        {trip.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
 
                                {/* Body: patient + route */}
                                <div className="sb-dtrips__mission-body">
                                    {/* Patient */}
                                    <div className="sb-dtrips__mission-col">
                                        <span className="sb-dtrips__col-label">Patient</span>
                                        <span className="sb-dtrips__col-primary">{trip.passenger.fullName}</span>
                                        <span className="sb-dtrips__col-secondary">{trip.passenger.phone}</span>
                                    </div>
 
                                    {/* Route */}
                                    <div className="sb-dtrips__mission-col">
                                        <span className="sb-dtrips__col-label">Route</span>
                                        <div className="sb-dtrips__route-line">
                                            <span className="sb-dtrips__route-icon" aria-label="Pickup">📍</span>
                                            <span>{trip.pickupAddress}</span>
                                        </div>
                                        <div className="sb-dtrips__route-line">
                                            <span className="sb-dtrips__route-icon" aria-label="Destination">🏥</span>
                                            <span>{destText || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>
 
                                {/* Footer: action */}
                                <div className="sb-dtrips__mission-footer">
                                    <button
                                        className="sb-dtrips__detail-btn"
                                        onClick={() => navigate(`/driver/trips/${trip.id}`)}
                                        aria-label={`View mission details for trip on ${formattedDate}`}
                                    >
                                        Mission Details
                                        <em className="sb-dtrips__detail-btn-arrow" aria-hidden="true">→</em>
                                    </button>
                                </div>
 
                            </article>
                        );
                    })}
                </div>
            )}
 
        </div>
    </div>
);
}
 
export default DriverTrips;