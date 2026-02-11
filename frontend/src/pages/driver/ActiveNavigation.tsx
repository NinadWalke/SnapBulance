import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export interface ActiveNavigationProps {}
 
const ActiveNavigation: React.FC<ActiveNavigationProps> = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    
    // Status: 'TO_PICKUP' or 'TO_HOSPITAL'
    const [status, setStatus] = useState<'TO_PICKUP' | 'TO_HOSPITAL'>('TO_PICKUP');

    const handleStatusChange = () => {
        if (status === 'TO_PICKUP') {
            setStatus('TO_HOSPITAL');
        } else {
            // Arrived at Hospital -> Go to Handover Form
            navigate(`/driver/handover/${tripId}`);
        }
    };

    return ( 
        <div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            {/* Map Area */}
            <div style={{ flex: 2, background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2>🗺️ Navigation Map</h2>
                <p>Route to: {status === 'TO_PICKUP' ? 'Patient Location' : 'City Hospital'}</p>
            </div>

            {/* Instructions */}
            <div style={{ padding: '1.5rem', background: '#f8f9fa' }}>
                <h2 style={{ margin: 0 }}>
                    {status === 'TO_PICKUP' ? '➡️ Head to Pickup' : '🏥 Rush to Hospital'}
                </h2>
                <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
                    Turn right in 200m (Simulated)
                </p>
            </div>

            {/* Action Slider / Button */}
            <button 
                onClick={handleStatusChange}
                style={{ 
                    padding: '1.5rem', 
                    background: status === 'TO_PICKUP' ? '#007bff' : '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                {status === 'TO_PICKUP' ? 'ARRIVED AT PATIENT' : 'ARRIVED AT HOSPITAL'}
            </button>
        </div>
     );
}
 
export default ActiveNavigation;