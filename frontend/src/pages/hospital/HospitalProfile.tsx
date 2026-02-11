import * as React from 'react';
import { useState } from 'react';

export interface HospitalProfileProps {}
 
const HospitalProfile: React.FC<HospitalProfileProps> = () => {
    // Mock State for Resources
    const [resources, setResources] = useState({
        icuBeds: 2,
        ventilators: 1,
        generalBeds: 15
    });

    return ( 
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1>🏥 Hospital Resource Management</h1>
            <p style={{ color: '#666' }}>City General Hospital (ID: H-101)</p>
            
            <hr style={{ margin: '2rem 0' }} />

            <div style={{ marginBottom: '2rem' }}>
                <h3>🚑 Emergency Status</h3>
                <div style={{ padding: '1rem', background: '#e8f5e9', border: '1px solid green', borderRadius: '8px', color: 'green', fontWeight: 'bold' }}>
                    ✅ ACCEPTING PATIENTS
                </div>
            </div>

            <h3>🛏️ Live Inventory</h3>
            <p>Update these numbers to ensure accurate dispatching.</p>

            <div style={rowStyle}>
                <span>ICU Beds Available:</span>
                <input 
                    type="number" 
                    value={resources.icuBeds} 
                    onChange={(e) => setResources({...resources, icuBeds: parseInt(e.target.value)})}
                    style={inputStyle} 
                />
            </div>

            <div style={rowStyle}>
                <span>Ventilators Available:</span>
                <input 
                    type="number" 
                    value={resources.ventilators} 
                    onChange={(e) => setResources({...resources, ventilators: parseInt(e.target.value)})}
                    style={inputStyle} 
                />
            </div>

            <div style={rowStyle}>
                <span>General Ward Beds:</span>
                <input 
                    type="number" 
                    value={resources.generalBeds} 
                    onChange={(e) => setResources({...resources, generalBeds: parseInt(e.target.value)})}
                    style={inputStyle} 
                />
            </div>

            <button style={{ width: '100%', padding: '1rem', background: 'blue', color: 'white', border: 'none', marginTop: '2rem', cursor: 'pointer' }}>
                SAVE UPDATES
            </button>
        </div>
     );
}

const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px'
};

const inputStyle: React.CSSProperties = {
    padding: '0.5rem', width: '80px', textAlign: 'center', fontSize: '1.2rem'
};
 
export default HospitalProfile;